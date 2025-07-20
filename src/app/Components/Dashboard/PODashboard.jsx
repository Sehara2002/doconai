// components/DashboardContent.jsx
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';

const COLORS = ['#166394', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'];

export default function DashboardContent() {
  const [userData, setUserData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [recentUploads, setRecentUploads] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalProjects: 0,
    totalDocuments: 0,
    completedProjects: 0,
    inProgressProjects: 0
  });

  const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Add this useEffect to monitor documents state changes
  useEffect(() => {
    console.log('Documents state updated:', documents);
    console.log('Documents array length:', documents.length);
  }, [documents]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch user profile to determine role
      const userResponse = await fetch(`${baseURL}/user/profile`, { headers });
      const user = await userResponse.json();
      setUserData(user);

      // Fetch data based on user role
      if (user.user_role === 'Project Owner') {
        await fetchProjectOwnerData(user, headers);
      } else if (user.user_role === 'Project Manager') {
        await fetchProjectManagerData(user, headers);
      } else {
        await fetchRegularUserData(user, headers);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectOwnerData = async (user, headers) => {
    try {
      // Get user ID by decoding token
      const token = localStorage.getItem('token');
      const tokenResponse = await fetch(`${baseURL}/user/decode-token?token=${token}`, { headers });
      const tokenData = await tokenResponse.json();
      const userId = tokenData.user_id;

      // Fetch owned projects
      const projectsResponse = await fetch(`${baseURL}/staff/owner/${userId}/projects`, { headers });
      const projectsData = await projectsResponse.json();
      setProjects(projectsData.projects || []);

      // Fetch project documents
      const documentsResponse = await fetch(`${baseURL}/api/doc/user/${userId}/project-documents`, { headers });
      const documentsData = await documentsResponse.json();
      console.log('=== DOCUMENTS DEBUG ===');
      console.log('API Response:', documentsData);
      console.log('recent_documents:', documentsData.recent_documents);
      console.log('Is array?', Array.isArray(documentsData.recent_documents));
      console.log('About to set documents with:', documentsData.recent_documents || []);
      setDocuments(documentsData.recent_documents || []);
      console.log('=== END DEBUG ===');

      // Fetch recent uploads (limit to 8 for display)
      const recentResponse = await fetch(`${baseURL}/api/doc/fetchall?limit=8`, { headers });
      const recentData = await recentResponse.json();
      setRecentUploads(Array.isArray(recentData) ? recentData.slice(0, 8) : []);

      // Fetch staff created by this owner
      const staffResponse = await fetch(`${baseURL}/user/list-users`, { headers });
      const staffData = await staffResponse.json();
      setStaffData(staffData || []);

      // Calculate stats
      const totalProjects = projectsData.projects?.length || 0;
      const completedProjects = projectsData.projects?.filter(p => p.project_status === 'Completed').length || 0;
      const inProgressProjects = projectsData.projects?.filter(p => p.project_status === 'In Progress').length || 0;

      setDashboardStats({
        totalProjects,
        totalDocuments: documentsData.recent_documents?.length || 0,
        completedProjects,
        inProgressProjects,
        totalStaff: staffData.length || 0
      });

    } catch (error) {
      console.error('Error fetching project owner data:', error);
    }
  };

  const fetchProjectManagerData = async (user, headers) => {
    try {
      const token = localStorage.getItem('token');
      const tokenResponse = await fetch(`${baseURL}/user/decode-token?token=${token}`, { headers });
      const tokenData = await tokenResponse.json();
      const userId = tokenData.user_id;

      // Fetch assigned projects
      const projectsResponse = await fetch(`${baseURL}/staff/user/${userId}/projects`, { headers });
      const projectsData = await projectsResponse.json();
      setProjects(projectsData.projects || []);

      // Fetch project documents
      const documentsResponse = await fetch(`${baseURL}/api/doc/user/${userId}/project-documents`, { headers });
      const documentsData = await documentsResponse.json();
      setDocuments(documentsData.recent_documents || []);

      // Fetch recent uploads
      const recentResponse = await fetch(`${baseURL}/api/doc/fetchall?limit=8`, { headers });
      const recentData = await recentResponse.json();
      setRecentUploads(Array.isArray(recentData) ? recentData.slice(0, 8) : []);

      setDashboardStats({
        totalProjects: projectsData.projects?.length || 0,
        totalDocuments: documentsData.recent_documents?.length || 0,
        completedProjects: projectsData.projects?.filter(p => p.project_status === 'Completed').length || 0,
        inProgressProjects: projectsData.projects?.filter(p => p.project_status === 'In Progress').length || 0
      });

    } catch (error) {
      console.error('Error fetching project manager data:', error);
    }
  };

  const fetchRegularUserData = async (user, headers) => {
    try {
      const token = localStorage.getItem('token');
      const tokenResponse = await fetch(`${baseURL}/user/decode-token?token=${token}`, { headers });
      const tokenData = await tokenResponse.json();
      const userId = tokenData.user_id;

      // Fetch user's assigned projects
      const projectsResponse = await fetch(`${baseURL}/staff/user/${userId}/projects`, { headers });
      const projectsData = await projectsResponse.json();
      setProjects(projectsData.projects || []);

      // Fetch user's uploaded documents
      const documentsResponse = await fetch(`${baseURL}/api/doc/user/${userId}/documents`, { headers });
      const documentsData = await documentsResponse.json();
      setDocuments(documentsData.recent_documents || []);

      // Fetch recent uploads for display
      const recentResponse = await fetch(`${baseURL}/api/doc/fetchall?limit=8`, { headers });
      const recentData = await recentResponse.json();
      setRecentUploads(Array.isArray(recentData) ? recentData.slice(0, 8) : []);

      setDashboardStats({
        totalProjects: projectsData.projects?.length || 0,
        totalDocuments: documentsData.recent_documents?.length || 0,
        completedProjects: 0, // Regular users might not see project status
        inProgressProjects: projectsData.projects?.length || 0
      });

    } catch (error) {
      console.error('Error fetching regular user data:', error);
    }
  };

  const getDocumentTypeStats = () => {
    console.log('getDocumentTypeStats - documents:', documents);
    console.log('documents length:', documents.length);
    
    if (!documents || documents.length === 0) {
      return [{ name: 'No Documents', value: 0 }];
    }
    
    const typeCount = {};
    documents.forEach(doc => {
      const category = doc.document_category || 'Other';
      typeCount[category] = (typeCount[category] || 0) + 1;
    });
    
    console.log('Document type count:', typeCount);
    const entries = Object.entries(typeCount);
    return entries.length > 0 
      ? entries.map(([name, value]) => ({ name, value }))
      : [{ name: 'No Documents', value: 0 }];
  };

  const getproject_statusData = () => {
    const statusCount = { 'Completed': 0, 'In Progress': 0, 'Delayed': 0 };
    projects.forEach(project => {
      const status = project.project_status || 'Delayed';
      if (statusCount[status] !== undefined) {
        statusCount[status]++;
      }
    });
    
    const entries = Object.entries(statusCount);
    return entries.length > 0 
      ? entries.map(([name, value]) => ({ name, value }))
      : [{ name: 'No Projects', value: 0 }];
  };

  const getMonthlyUploadData = () => {
    const monthlyData = {};
    documents.forEach(doc => {
      if (doc.last_modified_date) {
        const month = new Date(doc.last_modified_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        monthlyData[month] = (monthlyData[month] || 0) + 1;
      }
    });
    
    const entries = Object.entries(monthlyData);
    return entries.length > 0 
      ? entries.slice(-6).map(([month, uploads]) => ({ month, uploads }))
      : [{ month: 'No Data', uploads: 0 }];
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#166394]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#166394] mb-2">
          Welcome back, {userData?.firstname} {userData?.lastname}!
        </h1>
        <p className="text-gray-600">
          {userData?.user_role} Dashboard - Here's what's happening with your projects today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-[#166394]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-3xl font-bold text-[#166394]">{dashboardStats.totalProjects}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="h-8 w-8 text-[#166394]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Documents</p>
              <p className="text-3xl font-bold text-green-600">{dashboardStats.totalDocuments}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-yellow-600">{dashboardStats.inProgressProjects}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-purple-600">{dashboardStats.completedProjects}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Project Status Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-[#166394] mb-4 flex items-center">
            <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Project Status Overview
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getproject_statusData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {getproject_statusData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Document Types Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-[#166394] mb-4 flex items-center">
            <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 2v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Document Categories
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getDocumentTypeStats()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#166394" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Upload Trend */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <h3 className="text-xl font-semibold text-[#166394] mb-4 flex items-center">
          <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Document Upload Trends (This Month - Daily)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={getMonthlyUploadData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey="uploads" 
              stroke="#166394" 
              fill="#166394" 
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Projects */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <h3 className="text-xl font-semibold text-[#166394] mb-6 flex items-center">
          <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Recent Projects
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.slice(0, 6).map((project, index) => (
            <div key={project._id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-lg text-gray-800 truncate">{project.project_name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  project.project_status === 'Completed' ? 'bg-green-100 text-green-800' :
                  project.project_status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {project.project_status || 'Upcoming'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{project.client}</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Client: {project.client}</span>
                <span>{new Date(project.start_date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Document Uploads */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-[#166394] mb-6 flex items-center">
          <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Recent Document Uploads
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentUploads.map((document, index) => (
            <div key={document._id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <svg className="h-6 w-6 text-[#166394]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 truncate">{document.document_name}</h4>
                  <p className="text-xs text-gray-500">{document.document_category}</p>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                {document.last_modified_date ? new Date(document.last_modified_date).toLocaleDateString() : 'Recent'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}