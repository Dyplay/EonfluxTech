'use client';

import { useState, useEffect } from 'react';
import { 
  FiUsers, 
  FiSearch, 
  FiFilter, 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertCircle,
  FiChevronDown,
  FiArrowLeft,
  FiArrowRight,
  FiTrash2,
  FiEdit2,
  FiLock,
  FiUserX,
  FiUserCheck,
  FiMoreVertical
} from 'react-icons/fi';

interface User {
  id: string;
  name: string;
  email: string;
  emailVerification: 'verified' | 'unverified';
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'suspended' | 'banned';
  lastLogin: string;
  createdAt: string;
  profilePicture: string | null;
  gumroad_connections: {
    connected: boolean;
    productIds: string[];
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string[]>(['admin', 'user', 'moderator']);
  const [verifiedFilter, setVerifiedFilter] = useState<string[]>(['verified', 'unverified']);
  const [gumroadFilter, setGumroadFilter] = useState<string[]>(['connected', 'unconnected']);
  
  // Add state for controlling dropdown visibility
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [verifiedDropdownOpen, setVerifiedDropdownOpen] = useState(false);
  const [gumroadDropdownOpen, setGumroadDropdownOpen] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Check if click is outside of any dropdown
      if (!target.closest('#role-filter-button') && !target.closest('#role-dropdown')) {
        setRoleDropdownOpen(false);
      }
      
      if (!target.closest('#verification-filter-button') && !target.closest('#verification-dropdown')) {
        setVerifiedDropdownOpen(false);
      }
      
      if (!target.closest('#gumroad-filter-button') && !target.closest('#gumroad-dropdown')) {
        setGumroadDropdownOpen(false);
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Mock data
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      emailVerification: 'verified',
      role: 'admin',
      status: 'active',
      lastLogin: '2023-10-15T14:30:00Z',
      createdAt: '2023-05-10T09:15:00Z',
      profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
      gumroad_connections: {
        connected: true,
        productIds: ['prod_123', 'prod_456']
      }
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      emailVerification: 'verified',
      role: 'user',
      status: 'active',
      lastLogin: '2023-10-14T09:45:00Z',
      createdAt: '2023-06-22T11:30:00Z',
      profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg',
      gumroad_connections: {
        connected: true,
        productIds: ['prod_123']
      }
    },
    {
      id: '3',
      name: 'David Johnson',
      email: 'david.johnson@example.com',
      emailVerification: 'unverified',
      role: 'user',
      status: 'active',
      lastLogin: '2023-10-10T16:20:00Z',
      createdAt: '2023-07-05T14:45:00Z',
      profilePicture: null,
      gumroad_connections: {
        connected: false,
        productIds: []
      }
    },
    {
      id: '4',
      name: 'Sarah Williams',
      email: 'sarah.williams@example.com',
      emailVerification: 'verified',
      role: 'moderator',
      status: 'active',
      lastLogin: '2023-10-12T11:15:00Z',
      createdAt: '2023-05-18T08:30:00Z',
      profilePicture: 'https://randomuser.me/api/portraits/women/4.jpg',
      gumroad_connections: {
        connected: true,
        productIds: ['prod_789']
      }
    },
    {
      id: '5',
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      emailVerification: 'unverified',
      role: 'user',
      status: 'suspended',
      lastLogin: '2023-09-30T15:40:00Z',
      createdAt: '2023-08-01T10:20:00Z',
      profilePicture: null,
      gumroad_connections: {
        connected: false,
        productIds: []
      }
    }
  ];

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Simulate API call
        setLoading(true);
        
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Set mock data
        setUsers(mockUsers);
        setError(null);
      } catch (err) {
        setError('Failed to fetch users. Please try again later.');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter.includes(user.role);
    const matchesVerification = verifiedFilter.includes(user.emailVerification);
    const matchesGumroad = 
      (gumroadFilter.includes('connected') && user.gumroad_connections.connected) || 
      (gumroadFilter.includes('unconnected') && !user.gumroad_connections.connected);
    
    return matchesSearch && matchesRole && matchesVerification && matchesGumroad;
  });

  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get role badge class
  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/30';
      case 'moderator':
        return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/30';
      case 'user':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800/30';
      case 'suspended':
        return 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/30';
      case 'banned':
        return 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/30';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Users</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            A list of all users in your account including their name, email, role, and status.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 dark:bg-blue-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto transition-all duration-200"
          >
            <FiUsers className="mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 px-5 py-4 rounded-md shadow-sm" role="alert">
          <div className="flex">
            <FiAlertCircle className="h-5 w-5 mr-2" />
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      )}

      {/* Filters and search */}
      <div className="mt-6 md:flex justify-between space-y-4 md:space-y-0">
        <div className="w-full md:w-1/3 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400 dark:text-gray-500" aria-hidden="true" />
          </div>
          <input
            type="text"
            placeholder="Search users..."
            className="block w-full pl-10 h-11 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400 transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap md:flex-nowrap gap-3">
          {/* Role filter */}
          <div className="relative inline-block text-left">
            <div>
              <button
                type="button"
                className="inline-flex justify-center w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2.5 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                id="role-filter-button"
                aria-expanded={roleDropdownOpen}
                aria-haspopup="true"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              >
                <FiFilter className="mr-2 h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                Role
                <FiChevronDown className={`ml-2 h-5 w-5 text-gray-400 dark:text-gray-500 transition-transform ${roleDropdownOpen ? 'transform rotate-180' : ''}`} aria-hidden="true" />
              </button>
            </div>

            {roleDropdownOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10 border border-gray-200 dark:border-gray-700"
                id="role-dropdown">
                <div className="py-1 divide-y divide-gray-200 dark:divide-gray-700">
                  {['admin', 'moderator', 'user'].map((role) => (
                    <div key={role} className="px-4 py-3">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={roleFilter.includes(role)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRoleFilter([...roleFilter, role]);
                            } else {
                              setRoleFilter(roleFilter.filter(r => r !== role));
                            }
                          }}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-500 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:focus:ring-blue-800 dark:focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">{role}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Email verification filter */}
          <div className="relative inline-block text-left">
            <div>
              <button
                type="button"
                className="inline-flex justify-center w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2.5 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                id="verification-filter-button"
                aria-expanded={verifiedDropdownOpen}
                aria-haspopup="true"
                onClick={() => setVerifiedDropdownOpen(!verifiedDropdownOpen)}
              >
                <FiCheckCircle className="mr-2 h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                Verification
                <FiChevronDown className={`ml-2 h-5 w-5 text-gray-400 dark:text-gray-500 transition-transform ${verifiedDropdownOpen ? 'transform rotate-180' : ''}`} aria-hidden="true" />
              </button>
            </div>

            {verifiedDropdownOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10 border border-gray-200 dark:border-gray-700"
                id="verification-dropdown">
                <div className="py-1 divide-y divide-gray-200 dark:divide-gray-700">
                  {['verified', 'unverified'].map((status) => (
                    <div key={status} className="px-4 py-3">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={verifiedFilter.includes(status)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setVerifiedFilter([...verifiedFilter, status]);
                            } else {
                              setVerifiedFilter(verifiedFilter.filter(s => s !== status));
                            }
                          }}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-500 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:focus:ring-blue-800 dark:focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">{status}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Gumroad connection filter */}
          <div className="relative inline-block text-left">
            <div>
              <button
                type="button"
                className="inline-flex justify-center w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2.5 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                id="gumroad-filter-button"
                aria-expanded={gumroadDropdownOpen}
                aria-haspopup="true"
                onClick={() => setGumroadDropdownOpen(!gumroadDropdownOpen)}
              >
                <FiFilter className="mr-2 h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                Gumroad
                <FiChevronDown className={`ml-2 h-5 w-5 text-gray-400 dark:text-gray-500 transition-transform ${gumroadDropdownOpen ? 'transform rotate-180' : ''}`} aria-hidden="true" />
              </button>
            </div>

            {gumroadDropdownOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10 border border-gray-200 dark:border-gray-700"
                id="gumroad-dropdown">
                <div className="py-1 divide-y divide-gray-200 dark:divide-gray-700">
                  {['connected', 'unconnected'].map((status) => (
                    <div key={status} className="px-4 py-3">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={gumroadFilter.includes(status)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setGumroadFilter([...gumroadFilter, status]);
                            } else {
                              setGumroadFilter(gumroadFilter.filter(s => s !== status));
                            }
                          }}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-500 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:focus:ring-blue-800 dark:focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">{status}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Users table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 dark:ring-opacity-20 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200 sm:pl-6">
                      User
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">
                      Email
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">
                      Role
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">
                      Gumroad
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">
                      Created
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        Loading users...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        No users found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {user.profilePicture ? (
                                <img className="h-10 w-10 rounded-full object-cover shadow-sm border border-gray-200 dark:border-gray-700" src={user.profilePicture} alt={user.name} />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shadow-sm border border-gray-300 dark:border-gray-600">
                                  <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                    {user.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Last login: {formatDate(user.lastLogin)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <div className="flex items-center">
                            <span className="text-gray-900 dark:text-white">{user.email}</span>
                            {user.emailVerification === 'verified' ? (
                              <FiCheckCircle className="ml-1.5 text-green-500 dark:text-green-400" title="Email verified" />
                            ) : (
                              <FiXCircle className="ml-1.5 text-gray-400 dark:text-gray-500" title="Email not verified" />
                            )}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {user.gumroad_connections.connected ? (
                            <div className="flex items-center">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800/30">
                                Connected
                              </span>
                              <span className="ml-2 text-xs">
                                ({user.gumroad_connections.productIds.length} products)
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                              Not connected
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex space-x-3 justify-end">
                            <button
                              type="button"
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors duration-150"
                              title="Edit user"
                            >
                              <FiEdit2 size={18} />
                            </button>
                            <button
                              type="button"
                              className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300 transition-colors duration-150"
                              title="Reset password"
                            >
                              <FiLock size={18} />
                            </button>
                            <button
                              type="button" 
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors duration-150"
                              title="Delete user"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* User count */}
      <div className="mt-4 text-sm text-gray-700 dark:text-gray-300">
        Showing {filteredUsers.length} of {users.length} users
      </div>
    </div>
  );
} 