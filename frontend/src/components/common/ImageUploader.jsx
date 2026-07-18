import { useState } from 'react';
import { uploadApi } from '../../services/uploadApi';

export const ImageUploader = ({ folder, onUploaded }) => {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const handleChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setStatus('loading');
      setError('');
      const response = await uploadApi.uploadImage(file, folder);
      onUploaded(response.data.data.image);
      setStatus('succeeded');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Upload failed');
      setStatus('failed');
    }
  };

  return (
    <div className="space-y-1">
      <input className="w-full text-sm" type="file" accept="image/*" onChange={handleChange} />
      {status === 'loading' && <p className="text-xs text-slate-500">Uploading...</p>}
      {status === 'succeeded' && <p className="text-xs text-emerald-700">Image uploaded</p>}
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
};
