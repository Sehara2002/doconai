"use client";

import { useState, useMemo, useEffect } from "react";
import Header from '../../../Components/Projects/Header';
import FilterPopup from '../../../Components/Projects/FilterPopup';
import ProjectDetailsPopup from '../../../Components/Projects/ProjectDetailsPopup';
import ProjectList from '../../../Components/Projects/ProjectList';
import DocumentSidebar from '../../../Components/DocumentComponents/DocumentSidebar';

// Helper to get token from localStorage (or cookies if you use them)
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

const parseDate = (dateString) => {
  if (!dateString) return new Date(0);
  try {
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/');
      return new Date(`${year}-${month}-${day}`);
    }
    return new Date(dateString);
  } catch {
    return new Date(0);
  }
};

const mapStatusToFilter = (status) => {
  const statusMap = {
    'In Progress': 'In Progress',
    'Completed': 'Completed',
    'Delayed': 'Delayed',
  };
  return statusMap[status] || status;
};

export default function ProjectsDashboard() {
  const [allProjects, setAllProjects] = useState([]);
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All Projects");
  const [isReversed, setIsReversed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFilterPopupVisible, setIsFilterPopupVisible] = useState(false);
  const [isProjectPopupVisible, setIsProjectPopupVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userInfo, setUserInfo] = useState(null);


  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);

      // Auto-open sidebar on desktop, close on mobile
      if (!mobile) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // Initial check
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    console.log(`Sidebar: ${!isSidebarOpen ? 'Open' : 'Closed'}`);
  };


  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/projects/getproject');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setAllProjects(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  // Refresh function to be passed to the popup
  const refreshProjects = async () => {
    await fetchProjects();
  };

  useEffect(() => {
    fetchProjects();

    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add missing handler functions
  const handleFilterClick = () => {
    setIsFilterPopupVisible(true);
  };

  const handleSortClick = () => {
    setIsReversed(!isReversed);
  };

  const handleNewProjectClick = () => {
    setIsProjectPopupVisible(true);
  };

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
  };

  const handleNewProjectSubmit = async (projectData) => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/projects/addproject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) throw new Error('Failed to create project');

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating project:', error);
      alert(`Error: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = useMemo(() => {
    if (loading || !userInfo?.user_id) return [];
    // Use assignedProjects if present
    let projects = assignedProjects.length > 0 ? assignedProjects : allProjects.filter(
      project => project.client_id === userInfo.user_id
    );
    // Status filter
    if (filter !== "All Projects") {
      projects = projects.filter(
        project => mapStatusToFilter(project.projectStatus) === filter
      );
    }
    // Search filter
    if (searchTerm) {
      projects = projects.filter(
        project =>
          project.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.projectLead?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return projects;
  }, [allProjects, loading, userInfo, filter, searchTerm, assignedProjects]);

  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      const dateA = parseDate(a.startDate);
      const dateB = parseDate(b.startDate);
      return isReversed ? dateA - dateB : dateB - dateA;
    });
  }, [filteredProjects, isReversed]);

  // Fetch user info from token
  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const res = await fetch(`http://127.0.0.1:8000/user/decode-token?token=${token}`);
        if (!res.ok) throw new Error("Failed to fetch user info");
        const user = await res.json();
        setUserRole(user?.user_role || null);
        setUserInfo(user); // Save the full user object
      } catch (err) {
        setUserRole(null);
        setUserInfo(null);
      }
    };
    fetchUserInfo();
  }, []);

  useEffect(() => {
    // Only run if allProjects and userInfo are loaded
    if (!loading && allProjects.length && userInfo?.user_id) {
      let projects = allProjects.filter(
        project => project.client_id === userInfo.user_id
      );

      if (projects.length === 0) {
        // Fetch assigned projects if none owned
        fetch(`http://127.0.0.1:8000/staff/user/${userInfo.user_id}/projects`)
          .then(res => res.json())
          .then(data => {
            // Map API response to your frontend format
            const mapped = data.projects.map(p => ({
              projectId: p.project_id,
              projectName: p.project_name,
              projectStatus: p.project_status,
              startDate: new Date(Number(p.start_date.$date.$numberLong)).toISOString(),
              endDate: new Date(Number(p.end_date.$date.$numberLong)).toISOString(),
              client: p.client,
              projectLead: p.projectLead, 
            }));
            setAssignedProjects(mapped);
          });
      } else {
        setAssignedProjects([]);
      }
    }
  }, [allProjects, loading, userInfo]);

  if (loading) return (
    <div className="flex h-screen">
      <DocumentSidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} isMobile={isMobile} />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading projects...</p>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex h-screen">
      <DocumentSidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} isMobile={isMobile} />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Projects</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchProjects}
            className="bg-sky-700 text-white px-4 py-2 rounded-lg hover:bg-sky-800"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <DocumentSidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        isMobile={isMobile}
        active={'documents'}
      />

      {/* Main Content Area */}
      <div className={`
        flex-1 flex flex-col overflow-y-auto min-h-screen
        pt-[150px] max-[600px]:pt-[150px] max-[765px]:pt-[10px] md:pt-[50px] lg:pt-[20px]
        transition-all duration-300 ease-in-out
        ${!isMobile && isSidebarOpen ? 'ml-2' : 'ml-0'}
      `}>
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <Header
            onFilterClick={handleFilterClick}
            onSortClick={handleSortClick}
            isReversed={isReversed}
            onNewProjectClick={handleNewProjectClick}
            onSearch={handleSearch}
            projects={allProjects}
            showNewProjectButton={userRole === "Project Owner"}
          />

          <ProjectList
            projects={sortedProjects}
            filter={filter}
            isMobile={isMobile}
          />

          <FilterPopup
            isVisible={isFilterPopupVisible}
            onClose={() => setIsFilterPopupVisible(false)}
            onFilterChange={setFilter}
            currentFilter={filter}
          />

          {isProjectPopupVisible && (
            <ProjectDetailsPopup
              onClose={() => setIsProjectPopupVisible(false)}
              onSubmit={handleNewProjectSubmit}
              onRefresh={refreshProjects}
              isLoading={loading}
              defaultClient={userInfo?.username || ""}
              clientId={userInfo?.user_id || ""}
            />
          )}
        </div>
      </div>
    </div>
  );
}