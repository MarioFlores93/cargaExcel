import { useState } from "react";
import axios from "axios";

const StoryblokUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const SPACE_ID = import.meta.env.VITE_STORYBLOK_SPACE_ID;
  const MANAGEMENT_TOKEN = import.meta.env.VITE_STORYBLOK_MANAGEMENT_TOKEN;

  const handleUpload = async () => {
    if (!file) return alert("Selecciona un archivo");
    setLoading(true);

    try {
      // 1. Pedir URL de subida
      const { data } = await axios.post(
        `https://mapi.storyblok.com/v1/spaces/${SPACE_ID}/assets`,
        { filename: file.name },
        {
          headers: { Authorization: `Bearer ${MANAGEMENT_TOKEN}` },
        }
      );

      const { fields, post_url, id } = data;

      // 2. Subir a S3
      const formData = new FormData();
      Object.keys(fields).forEach((key) => formData.append(key, fields[key]));
      formData.append("file", file);

      await axios.post(post_url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 3. Confirmar en Storyblok
      await axios.put(
        `https://mapi.storyblok.com/v1/spaces/${SPACE_ID}/assets/${id}`,
        { asset: { id } },
        { headers: { Authorization: `Bearer ${MANAGEMENT_TOKEN}` } }
      );

      alert("✅ Archivo subido a Storyblok");
    } catch (err) {
      console.error(err);
      alert("❌ Error al subir archivo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-box">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
      />
      <button disabled={loading} onClick={handleUpload}>
        {loading ? "Subiendo..." : "Subir a Storyblok"}
      </button>
    </div>
  );
};

export default StoryblokUpload;