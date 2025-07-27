import React, { useState } from 'react';

export default function Uploads() {
  const [files, setFiles] = useState([]);
  return (
    <div>
      <h2>Photo Uploads</h2>
      <input
        type="file"
        multiple
        onChange={e => setFiles(Array.from(e.target.files))}
      />
      <ul>
        {files.map((f, i) => <li key={i}>{f.name}</li>)}
      </ul>
    </div>
  );
}
