'use client';

import {
  Book,
  BoxIcon,
  LayoutDashboardIcon,
  LibraryBig,
  MessageCircle,
  Menu,
  FileText,
  X,
  FileDiff,
  Users,
} from 'lucide-react';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function DocumentSidebar({ isOpen, onToggle, isMobile }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState('');

  // Fetch user role on mount
  useEffect(() => {
    const fetchRole = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch('http://localhost:8000/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setUserRole(data.user_role || '');
      } catch (err) {
        console.error('Error fetching user role', err);
      }
    };

    fetchRole();
  }, []);

  // Determine active section
  const getActiveSidebarItem = () => {
    if (pathname.includes('/DocLibrary')) return 'library';
    if (pathname.includes('/Dashboard')) return 'dashboard';
    if (pathname.includes('/Chatbot')) return 'chat';
    if (pathname.includes('/Projects')) return 'projects';
    if (pathname.includes('/UserManagement')) return 'users';
    if (pathname.includes('/DocumentComparator')) return 'documentComparator';
    return 'home';
  };

  const activeStatus = getActiveSidebarItem();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isOpen && !event.target.closest('.sidebar-container')) {
        onToggle();
      }
    };

    if (isMobile && isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobile, isOpen, onToggle]);

  useEffect(() => {
    document.body.style.overflow = isMobile && isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
          onClick={onToggle}
        />
      )}

      {/* Mobile Toggle Button */}
      <button
        onClick={onToggle}
        className={`
          fixed top-4 left-4 z-50 lg:hidden
          bg-sky-900 text-white p-3 rounded-lg shadow-lg
          hover:bg-sky-800 transition-all duration-200
          ${isOpen ? 'translate-x-60' : 'translate-x-0'}
        `}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`
          sidebar-container
          ${isMobile ? 'fixed' : 'relative'} left-0 top-0 h-full
          bg-sky-900 text-white w-60 p-4
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:relative lg:h-auto lg:w-70
          ${isMobile && isOpen ? 'z-50' : 'z-30'}
          overflow-y-auto flex-shrink-0 h-full
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <BoxIcon width={40} height={40} className="text-white" />
            <h2 className="text-xl font-bold ml-3">Docon. AI</h2>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden text-white hover:text-sky-200 p-2"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          <SidebarItem
            icon={<LayoutDashboardIcon size={24} />}
            label="Dashboard"
            isActive={activeStatus === 'dashboard'}
            route="/Client/Dashboard"
            onClick={onToggle}
          />
          <SidebarItem
            icon={<LibraryBig size={24} />}
            label="Documents"
            isActive={activeStatus === 'library'}
            route="/Client/DocLibrary"
            onClick={onToggle}
          />
          <SidebarItem
            icon={<FileText size={24} />}
            label="Projects"
            isActive={activeStatus === 'projects'}
            route="/Client/Projects"
            onClick={onToggle}
          />
          <SidebarItem
            icon={<MessageCircle size={24} />}
            label="Docon ChatBot"
            isActive={activeStatus === 'chat'}
            route="/Client/Chatbot"
            onClick={onToggle}
          />
          <SidebarItem
            icon={<FileDiff size={24} />}
            label="Document Comparator"
            isActive={activeStatus === 'documentComparator'}
            route="/Client/DocumentComparator"
            onClick={onToggle}
          />

          {/* Conditionally Rendered */}
          {userRole === 'Project Owner' && (
            <SidebarItem
              icon={<Users size={24} />}
              label="User Management"
              isActive={activeStatus === 'users'}
              route="/Client/UserManagement"
              onClick={onToggle}
            />
          )}
        </nav>


        {/* Footer */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-sky-800 rounded-lg p-3">
            <p className="text-sm text-sky-200">Welcome back!</p>
            <p className="text-xs text-sky-300 mt-1">
              Manage your documents efficiently
            </p>
          </div>
        </div>
      </div>
    </>
  );

}

// Sidebar Item Component
function SidebarItem({ icon, label, isActive, route, onClick }) {
  const router = useRouter();

  return (
    <li
      className={`
        flex items-center px-4 py-3 rounded-lg cursor-pointer
        transition-all duration-200 group
        ${isActive ? 'bg-sky-800 text-white shadow-md' : 'text-sky-100 hover:bg-sky-800 hover:text-white'}
      `}
      onClick={() => {
        router.push(route);
        if (window.innerWidth < 1024) {
          onClick(); // Close mobile sidebar after navigation
        }
      }}
    >
      <span className={`transition-colors duration-200 ${isActive ? 'text-white' : 'text-sky-300 group-hover:text-white'}`}>
        {icon}
      </span>
      <span className="ml-3 font-medium">{label}</span>
      {isActive && <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>}
    </li>
  );
}
