import { useState, ChangeEvent } from "react";
import axios from "axios";

interface StoryblokUploadResponse {
  fields: Record<string, string>;
  post_url: string;
}

const UploadCSV = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [finalUrl, setFinalUrl] = useState<string>("");

  // ⚠️ Poner tus datos reales aquí
  const SPACE_ID = "287407998339704"; // 👈 tu Space ID de Storyblok
  const MANAGEMENT_TOKEN = "nSpo8W9rYUh4rTJEt3nv0wtt"; // 👈 token personal con permisos de assets

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Selecciona un archivo CSV primero");
      return;
    }

    setUploading(true);

    try {
      // 1️⃣ Pedir a Storyblok los datos para subir el archivo
      const { data } = await axios.post<StoryblokUploadResponse>(
        `https://api.storyblok.com/v1/spaces/${SPACE_ID}/assets`,
        { filename: file.name },
        {
          headers: {
            Authorization: `Bearer ${MANAGEMENT_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      const res = await fetch("https://api.storyblok.com/v1/spaces/287407998339704/assets", {
  method: "POST",
  headers: {
    Authorization: "Bearer nSpo8W9rYUh4rTJEt3nv0wtt",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ filename: "clientes.csv" })
});

      const { fields, post_url } = data;

      // 2️⃣ Construir el formData para S3
      const formData = new FormData();
      Object.keys(fields).forEach((key) => {
        formData.append(key, fields[key]);
      });
      formData.append("file", file);

      // 3️⃣ Subir el archivo a S3 (Amazon)
      await axios.post(post_url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 4️⃣ Construir la URL final en Storyblok
      const key = fields.key; // ejemplo: "123456/clientes.csv"
      const url = `https://a.storyblok.com/f/${SPACE_ID}/${key.split("/").pop()}`;

      setFinalUrl(url);
      alert("Archivo subido correctamente ✅");
    } catch (error) {
      console.error("Error al subir CSV:", error);
      alert("Error al subir CSV ❌");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-4">
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        {uploading ? "Subiendo..." : "Subir CSV"}
      </button>

      {finalUrl && (
        <p className="text-green-600">
          Archivo disponible en:{" "}
          <a
            href={finalUrl}
            target="_blank"
            rel="noreferrer"
            className="underline text-blue-600"
          >
            {finalUrl}
          </a>
        </p>
      )}
    </div>
  );
};

export default UploadCSV;
