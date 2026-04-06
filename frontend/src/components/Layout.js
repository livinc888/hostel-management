import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // ✅ ADDED
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getNavItems = () => {
    if (user?.role === 'admin') {
      return [
        { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/admin/students', label: 'Students', icon: '👥' },
        { path: '/admin/rooms', label: 'Rooms', icon: '🏠' },
        { path: '/admin/fees', label: 'Fees', icon: '💰' },
        { path: '/admin/complaints', label: 'Complaints', icon: '📝' },
        { path: '/admin/attendance', label: 'Attendance', icon: '📅' },
        { path: '/admin/notices', label: 'Notices', icon: '📢' },
        { path: '/admin/leaves', label: 'Leaves', icon: '✈️' },
        { path: '/admin/reports', label: 'Reports', icon: '📈' },
      ];
    } else {
      return [
        { path: '/student/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/student/profile', label: 'Profile', icon: '👤' },
        { path: '/student/room', label: 'Room', icon: '🏠' },
        { path: '/student/fees', label: 'Fees', icon: '💰' },
        { path: '/student/complaints', label: 'Complaints', icon: '📝' },
        { path: '/student/leave', label: 'Leave', icon: '✈️' },
        { path: '/student/notices', label: 'Notices', icon: '📢' },
      ];
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">

      {/* ✅ MOBILE SIDEBAR */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => setSidebarOpen(false)}></div>

          <div className="relative flex flex-col w-64 bg-gray-800">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center px-4 text-white text-lg font-semibold">
                HostelMS
              </div>

              <nav className="mt-5 px-2 space-y-1">
                {getNavItems().map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)} // ✅ close after click
                    className={({ isActive }) =>
                      `${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'} block px-2 py-2 rounded-md`
                    }
                  >
                    {item.icon} {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* ✅ DESKTOP SIDEBAR */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-gray-800 text-white">
          <div className="flex items-center px-4 py-4 text-lg font-semibold">
            HostelMS
          </div>

          <nav className="px-2 space-y-1">
            {getNavItems().map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `${isActive ? 'bg-gray-900' : 'hover:bg-gray-700'} block px-2 py-2 rounded-md`
                }
              >
                {item.icon} {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex flex-col w-0 flex-1">

        {/* TOP BAR */}
        <div className="flex h-16 bg-white shadow items-center justify-between px-4">

          {/* ✅ BUTTON NOW WORKS */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-gray-500"
          >
            ☰
          </button>

          <div>Welcome, {user?.name}</div>

          <button onClick={handleLogout}>Logout</button>
        </div>

        {/* CONTENT */}
        <main className="flex-1 p-4 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default Layout;