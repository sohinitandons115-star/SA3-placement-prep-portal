import React, { useState, useEffect } from 'react';
import API from '../api/axiosConfig';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('DSA');
  const [link, setLink] = useState('');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const res = await API.get('/resources');
      setResources(res.data);
    } catch (err) {
      console.error('Failed to fetch resources');
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/resources', { title, category, link });
      setResources([res.data, ...resources]);
      setShowForm(false);
      setTitle('');
      setCategory('DSA');
      setLink('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/resources/${id}`);
      setResources(resources.filter(r => r._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-4xl font-extrabold uppercase tracking-tight text-zinc-900 dark:text-white border-b-4 border-zinc-900 dark:border-white pb-2">
          Prep Resources
        </h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="brutalist-button"
        >
          {showForm ? 'CANCEL' : '+ ADD RESOURCE'}
        </button>
      </div>

      {showForm && (
        <div className="brutalist-card p-6 mb-8 bg-zinc-50 dark:bg-zinc-800">
          <form onSubmit={handleAddResource} className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-bold uppercase text-zinc-900 dark:text-zinc-100 mb-1">Title</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="brutalist-input bg-white" />
            </div>
            <div className="w-full md:w-auto">
              <label className="block text-sm font-bold uppercase text-zinc-900 dark:text-zinc-100 mb-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="brutalist-input cursor-pointer bg-white uppercase">
                <option value="DSA">DSA</option>
                <option value="Aptitude">Aptitude</option>
                <option value="Resume">Resume</option>
                <option value="Interview Experience">Interview Experience</option>
                <option value="Core Subjects">Core Subjects</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-bold uppercase text-zinc-900 dark:text-zinc-100 mb-1">Link URL</label>
              <input type="url" required value={link} onChange={e => setLink(e.target.value)} className="brutalist-input bg-white" />
            </div>
            <button type="submit" className="brutalist-button bg-blue-600 border-blue-600 text-white shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] hover:shadow-[4px_4px_0px_0px_rgba(37,99,235,1)]">SAVE</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <div key={resource._id} className="brutalist-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-1 text-xs font-black uppercase border-2 border-zinc-900 dark:border-zinc-100 bg-yellow-200 text-zinc-900 dark:bg-yellow-900 dark:text-yellow-100 inline-block">
                  {resource.category}
                </span>
                <button onClick={() => handleDelete(resource._id)} className="text-zinc-400 hover:text-red-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <h3 className="text-2xl font-black uppercase text-zinc-900 dark:text-white leading-tight mb-4 break-words">
                {resource.title}
              </h3>
            </div>
            <a 
              href={resource.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 text-blue-600 dark:text-blue-400 hover:text-zinc-900 dark:hover:text-white font-bold uppercase tracking-wider inline-flex items-center underline underline-offset-4 transition-colors"
            >
              VISIT LINK <span className="ml-2 font-normal">→</span>
            </a>
          </div>
        ))}
        {resources.length === 0 && (
          <div className="col-span-full border-4 border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center">
            <p className="text-xl font-bold uppercase text-zinc-500 dark:text-zinc-400">
              No resources added yet. Be the first to add one!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;
