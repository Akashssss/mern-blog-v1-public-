import React, { useContext } from 'react'
import { EditorContext } from '../pages/editor.pages'

export default function Tag({ tag, tagIndex }) {


  let { blog, blog: { tags }, setBlog } = useContext(EditorContext)
  const handleTagDelete = () => {
    tags = tags.filter(t => t !== tag);
    setBlog({ ...blog, tags });
  }


  const handleTagEdit = (e) => {
    if (e.keyCode === 13 || e.keyCode === 188) {
      e.preventDefault();
      let currentTag = e.target.innerText;
      if (currentTag.trim().length > 0) {
        tags[tagIndex] = currentTag;
        setBlog({ ...blog, tags });
      }
      else {
        tags.splice(tagIndex, 1);
        setBlog({ ...blog, tags });
      }
      e.target.setAttribute("contentEditable", false);

    }
  }
  const addEditable = (e) => {
    e.target.setAttribute("contentEditable", true);
    e.target.focus();
  }
  return (
    <div className='relative p-2 mt-2 mr-2 px-5 bg-white rounded-full inline-block hover:bg-opacity-50 pr-10 '>
      <p
        className='outline-none'
        onKeyDown={handleTagEdit}
        onClick={addEditable}
        >{tag}</p>
      <button
        onClick={handleTagDelete}
        className='mt-[2px] absolute right-3 top-1/2 -translate-y-1/2 '>
        <i
          className='fi fi-br-cross text-sm pointer-events-none cursor-pointer '></i>
      </button>
    </div>
  )
}
