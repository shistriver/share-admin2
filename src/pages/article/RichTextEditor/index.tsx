import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
const RichTextEditor = () => {
 const [content, setContent] = useState('');
 return (
   <div>
     <h2>Rich Text Editor</h2>
     <ReactQuill theme="snow" value={content} onChange={setContent} />
     <h3>Preview:</h3>
     <div dangerouslySetInnerHTML={{ __html: content }} />
   </div>
 );
};
export default RichTextEditor;