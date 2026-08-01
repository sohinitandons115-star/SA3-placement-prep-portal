import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';

// VIBGYOR Colors mapping for the visualizer
const VIBGYOR = [
  'bg-purple-600', // V (0)
  'bg-indigo-600', // I (1)
  'bg-blue-600',   // B (2)
  'bg-green-600',  // G (3)
  'bg-yellow-400', // Y (4)
  'bg-orange-500', // O (5)
  'bg-red-600'     // R (6)
];

const BeltVisualizer = ({ count }) => {
  return (
    <div className="flex gap-1 mt-1">
      {[...Array(7)].map((_, i) => (
        <div 
          key={i} 
          className={`h-4 flex-1 border-2 border-zinc-900 dark:border-zinc-700 ${i < count ? VIBGYOR[i] : 'bg-transparent'}`}
        />
      ))}
    </div>
  );
};

const Dashboard = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // App Form state
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('Applied');

  // Edit Profile Form state
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileData, setProfileData] = useState({
    codingBelts: { java: 0, cpp: 0, python: 0, javascript: 0 },
    communicationScore: 0,
    attendance: { quarterly: 0, yearly: 0 },
    vivaScore: 0
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (user) {
      setProfileData({
        codingBelts: {
          java: user.codingBelts?.java || 0,
          cpp: user.codingBelts?.cpp || 0,
          python: user.codingBelts?.python || 0,
          javascript: user.codingBelts?.javascript || 0,
        },
        communicationScore: user.communicationScore || 0,
        attendance: {
          quarterly: user.attendance?.quarterly || 0,
          yearly: user.attendance?.yearly || 0,
        },
        vivaScore: user.vivaScore || 0
      });
    }
  }, [user]);

  const fetchCompanies = async () => {
    try {
      const res = await API.get('/companies');
      setCompanies(res.data);
    } catch (err) {
      console.error('Failed to fetch companies');
    }
  };

  const handleAddCompany = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/companies', { name, role, status });
      setCompanies([res.data, ...companies]);
      setShowForm(false);
      setName('');
      setRole('');
      setStatus('Applied');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/companies/${id}`);
      setCompanies(companies.filter(c => c._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profileData);
      setShowProfileEdit(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Client-side filtering
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          company.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || company.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Client-side aggregation mapping to exact prompt requirements
  const totalApplied = companies.length;
  const activeCount = companies.filter(c => !['Rejected', 'Selected'].includes(c.status)).length;
  const offeredCount = companies.filter(c => c.status === 'Selected').length;
  const rejectedCount = companies.filter(c => c.status === 'Rejected').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* KALVIUM ELIGIBILITY PROFILE */}
      {user && (
        <div className="mb-12">
          <div className="flex justify-between items-end mb-4 border-b-4 border-zinc-900 dark:border-zinc-100 pb-2">
            <h2 className="text-2xl font-extrabold uppercase tracking-tight text-zinc-900 dark:text-zinc-100">
              Kalvium Eligibility Profile
            </h2>
            <button onClick={() => setShowProfileEdit(!showProfileEdit)} className="text-sm font-bold uppercase underline underline-offset-4 hover:text-blue-600 transition-colors">
              {showProfileEdit ? 'Cancel Edit' : 'Edit Metrics'}
            </button>
          </div>

          {showProfileEdit ? (
            <form onSubmit={handleProfileUpdate} className="brutalist-card p-6 mb-6 bg-zinc-50 dark:bg-zinc-800">
              <h3 className="font-bold uppercase text-lg mb-4">Update Your Metrics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* Belts */}
                <div className="space-y-4 border-2 border-zinc-900 p-4">
                  <h4 className="font-black uppercase text-sm border-b-2 border-zinc-900 pb-1">Coding Belts (Max 7)</h4>
                  {['java', 'cpp', 'python', 'javascript'].map(lang => (
                    <div key={lang}>
                      <label className="block text-xs font-bold uppercase">{lang}</label>
                      <input 
                        type="number" min="0" max="7" 
                        value={profileData.codingBelts[lang]}
                        onChange={e => setProfileData({
                          ...profileData, 
                          codingBelts: { ...profileData.codingBelts, [lang]: parseInt(e.target.value) || 0 }
                        })}
                        className="brutalist-input py-1 text-sm bg-white" 
                      />
                    </div>
                  ))}
                </div>

                {/* Other Metrics */}
                <div className="space-y-4 border-2 border-zinc-900 p-4">
                  <h4 className="font-black uppercase text-sm border-b-2 border-zinc-900 pb-1">Scores</h4>
                  <div>
                    <label className="block text-xs font-bold uppercase">Communication Score</label>
                    <input 
                      type="number" step="0.1"
                      value={profileData.communicationScore}
                      onChange={e => setProfileData({...profileData, communicationScore: parseFloat(e.target.value) || 0})}
                      className="brutalist-input py-1 text-sm bg-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase">Project Viva Score</label>
                    <input 
                      type="number" step="0.1"
                      value={profileData.vivaScore}
                      onChange={e => setProfileData({...profileData, vivaScore: parseFloat(e.target.value) || 0})}
                      className="brutalist-input py-1 text-sm bg-white" 
                    />
                  </div>
                </div>

                {/* Attendance */}
                <div className="space-y-4 border-2 border-zinc-900 p-4">
                  <h4 className="font-black uppercase text-sm border-b-2 border-zinc-900 pb-1">Attendance (%)</h4>
                  <div>
                    <label className="block text-xs font-bold uppercase">Quarterly</label>
                    <input 
                      type="number" min="0" max="100"
                      value={profileData.attendance.quarterly}
                      onChange={e => setProfileData({
                        ...profileData, 
                        attendance: { ...profileData.attendance, quarterly: parseInt(e.target.value) || 0 }
                      })}
                      className="brutalist-input py-1 text-sm bg-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase">Yearly</label>
                    <input 
                      type="number" min="0" max="100"
                      value={profileData.attendance.yearly}
                      onChange={e => setProfileData({
                        ...profileData, 
                        attendance: { ...profileData.attendance, yearly: parseInt(e.target.value) || 0 }
                      })}
                      className="brutalist-input py-1 text-sm bg-white" 
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="brutalist-button w-full md:w-auto bg-blue-600 border-blue-600 text-white shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] hover:shadow-[4px_4px_0px_0px_rgba(37,99,235,1)]">
                SAVE PROFILE METRICS
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="brutalist-card p-4 flex flex-col justify-between md:col-span-2">
                <span className="text-sm font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-2 block border-b-2 border-zinc-100 dark:border-zinc-800 pb-1">Coding Belts</span>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <div>
                    <div className="flex justify-between items-end"><span className="text-xs uppercase font-bold">Java</span> <span className="font-black">{user.codingBelts?.java || 0}/7</span></div>
                    <BeltVisualizer count={user.codingBelts?.java || 0} />
                  </div>
                  <div>
                    <div className="flex justify-between items-end"><span className="text-xs uppercase font-bold">C++</span> <span className="font-black">{user.codingBelts?.cpp || 0}/7</span></div>
                    <BeltVisualizer count={user.codingBelts?.cpp || 0} />
                  </div>
                  <div>
                    <div className="flex justify-between items-end"><span className="text-xs uppercase font-bold">Python</span> <span className="font-black">{user.codingBelts?.python || 0}/7</span></div>
                    <BeltVisualizer count={user.codingBelts?.python || 0} />
                  </div>
                  <div>
                    <div className="flex justify-between items-end"><span className="text-xs uppercase font-bold">JavaScript</span> <span className="font-black">{user.codingBelts?.javascript || 0}/7</span></div>
                    <BeltVisualizer count={user.codingBelts?.javascript || 0} />
                  </div>
                </div>
              </div>
              <div className="brutalist-card p-4 flex flex-col justify-between">
                <span className="text-sm font-bold uppercase text-zinc-500 dark:text-zinc-400">Attendance</span>
                <div>
                  <div className="flex justify-between items-end mt-2"><span className="text-xs uppercase font-bold">Quarterly</span> <span className={`text-xl font-black ${(user.attendance?.quarterly || 0) >= 90 ? 'text-green-600' : 'text-red-600'}`}>{user.attendance?.quarterly || 0}%</span></div>
                  <div className="flex justify-between items-end"><span className="text-xs uppercase font-bold">Yearly</span> <span className={`text-xl font-black ${(user.attendance?.yearly || 0) >= 90 ? 'text-green-600' : 'text-red-600'}`}>{user.attendance?.yearly || 0}%</span></div>
                </div>
              </div>
              <div className="brutalist-card p-4 flex flex-col justify-between">
                <span className="text-sm font-bold uppercase text-zinc-500 dark:text-zinc-400">Scores</span>
                <div>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-xs uppercase font-bold">Communication</span>
                    <span className={`text-2xl font-black ${user.communicationScore > 8 ? 'text-green-600' : 'text-red-600'}`}>{user.communicationScore || 0}</span>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-xs uppercase font-bold">Project Viva</span>
                    <span className={`text-2xl font-black ${(user.vivaScore || 0) >= 6 ? 'text-green-600' : 'text-red-600'}`}>{user.vivaScore || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DASHBOARD OVERVIEW */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight text-zinc-900 dark:text-zinc-100 mb-6">Applications Overview</h1>
        
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="brutalist-card p-6 border-b-8 border-b-zinc-900 dark:border-b-zinc-100">
            <h3 className="text-sm font-bold uppercase text-zinc-500 dark:text-zinc-400">Total Companies</h3>
            <p className="text-4xl font-black text-zinc-900 dark:text-white mt-2">{totalApplied}</p>
          </div>
          <div className="brutalist-card p-6 border-b-8 border-b-blue-500">
            <h3 className="text-sm font-bold uppercase text-zinc-500 dark:text-zinc-400">Active Applications</h3>
            <p className="text-4xl font-black text-blue-600 dark:text-blue-400 mt-2">{activeCount}</p>
          </div>
          <div className="brutalist-card p-6 border-b-8 border-b-green-500">
            <h3 className="text-sm font-bold uppercase text-zinc-500 dark:text-zinc-400">Offers</h3>
            <p className="text-4xl font-black text-green-600 dark:text-green-400 mt-2">{offeredCount}</p>
          </div>
          <div className="brutalist-card p-6 border-b-8 border-b-red-500">
            <h3 className="text-sm font-bold uppercase text-zinc-500 dark:text-zinc-400">Rejected</h3>
            <p className="text-4xl font-black text-red-600 dark:text-red-400 mt-2">{rejectedCount}</p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex w-full md:w-auto gap-4">
            <input 
              type="text" 
              placeholder="SEARCH..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="brutalist-input uppercase font-bold text-sm min-w-[200px]"
            />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="brutalist-input uppercase font-bold text-sm cursor-pointer"
            >
              <option value="All">ALL STATUSES</option>
              <option value="Applied">APPLIED</option>
              <option value="Online Assessment">ONLINE ASSESSMENT</option>
              <option value="Technical Interview">TECHNICAL INTERVIEW</option>
              <option value="HR Interview">HR INTERVIEW</option>
              <option value="Selected">SELECTED</option>
              <option value="Rejected">REJECTED</option>
            </select>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="brutalist-button w-full md:w-auto"
          >
            {showForm ? 'CANCEL' : '+ ADD APPLICATION'}
          </button>
        </div>

        {/* Add Form (Inline) */}
        {showForm && (
          <div className="brutalist-card p-6 mb-6">
            <form onSubmit={handleAddCompany} className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-bold uppercase text-zinc-900 dark:text-zinc-100 mb-1">Company Name</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="brutalist-input" />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-bold uppercase text-zinc-900 dark:text-zinc-100 mb-1">Role</label>
                <input type="text" required value={role} onChange={e => setRole(e.target.value)} className="brutalist-input" />
              </div>
              <div className="w-full md:w-auto">
                <label className="block text-sm font-bold uppercase text-zinc-900 dark:text-zinc-100 mb-1">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="brutalist-input uppercase cursor-pointer">
                  <option value="Applied">Applied</option>
                  <option value="Online Assessment">Online Assessment</option>
                  <option value="Technical Interview">Technical Interview</option>
                  <option value="HR Interview">HR Interview</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <button type="submit" className="brutalist-button bg-green-500 text-black border-green-500 hover:text-green-500 shadow-none hover:shadow-[4px_4px_0px_0px_rgba(34,197,94,1)]">SAVE</button>
            </form>
          </div>
        )}

        {/* List */}
        <div className="border-2 border-zinc-900 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-x-auto">
          <table className="min-w-full divide-y-2 divide-zinc-900 dark:divide-zinc-700">
            <thead className="bg-zinc-100 dark:bg-zinc-950">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest border-r-2 border-zinc-900 dark:border-zinc-700">Company</th>
                <th className="px-6 py-4 text-left text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest border-r-2 border-zinc-900 dark:border-zinc-700">Role</th>
                <th className="px-6 py-4 text-left text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest border-r-2 border-zinc-900 dark:border-zinc-700">Status</th>
                <th className="px-6 py-4 text-left text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest border-r-2 border-zinc-900 dark:border-zinc-700">Date</th>
                <th className="px-6 py-4 text-right text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-zinc-900 dark:divide-zinc-700">
              {filteredCompanies.map((company) => (
                <tr key={company._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-zinc-900 dark:text-white border-r-2 border-zinc-900 dark:border-zinc-700">{company.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-700 dark:text-zinc-300 border-r-2 border-zinc-900 dark:border-zinc-700">{company.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm border-r-2 border-zinc-900 dark:border-zinc-700">
                    <span className={`px-2 py-1 inline-flex text-xs font-black uppercase border-2 
                      ${company.status === 'Selected' ? 'bg-green-100 text-green-800 border-green-800 dark:bg-green-900/30 dark:text-green-400 dark:border-green-400' : 
                        company.status === 'Rejected' ? 'bg-red-100 text-red-800 border-red-800 dark:bg-red-900/30 dark:text-red-400 dark:border-red-400' : 
                        'bg-zinc-100 text-zinc-800 border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-500'}`}>
                      {company.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-700 dark:text-zinc-300 border-r-2 border-zinc-900 dark:border-zinc-700">
                    {new Date(company.appliedDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-black">
                    <button onClick={() => handleDelete(company._id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 uppercase underline underline-offset-4">Delete</button>
                  </td>
                </tr>
              ))}
              {filteredCompanies.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400 font-bold uppercase">
                    NO APPLICATIONS FOUND.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
