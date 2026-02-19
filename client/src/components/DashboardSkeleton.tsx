const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="w-32 h-5 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Right side icons */}
            <div className="flex items-center space-x-4">
              <div className="w-7 h-6 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="w-8 h-6 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="w-20 h-8 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Page Title */}
        <div className="mb-6">
          <div className="w-48 h-7 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="w-64 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-2 border-b border-gray-200">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="px-4 py-2">
                <div
                  className={`w-16 h-5 bg-gray-200 rounded animate-pulse ${i === 0 ? "border-b-2 border-blue-500" : ""}`}
                ></div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats/Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
              <div className="w-12 h-6 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Filter/Search Bar */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <div className="flex flex-wrap gap-3">
            <div className="w-48 h-9 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-32 h-9 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-32 h-9 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-24 h-9 bg-gray-200 rounded animate-pulse ml-auto"></div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="w-32 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {[...Array(5)].map((_, i) => (
                    <th key={i} className="px-6 py-3 text-left">
                      <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(8)].map((_, rowIndex) => (
                  <tr key={rowIndex} className="border-t border-gray-100">
                    {[...Array(5)].map((_, colIndex) => (
                      <td key={colIndex} className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {colIndex === 0 && (
                            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                          )}
                          <div
                            className={`${colIndex === 0 ? "w-24" : "w-16"} h-4 bg-gray-200 rounded animate-pulse`}
                          ></div>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer/Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Additional Content Section */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Chart/Graph */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-36 h-5 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex justify-center mt-4 space-x-4">
              <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Right Column - Activity Feed */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-36 h-5 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="w-48 h-3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardSkeleton;
