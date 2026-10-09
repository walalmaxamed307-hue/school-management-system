import { Outlet } from 'react-router-dom'

// Layout-ka milkiilaha: sidebar/header ma leh — bog keliya oo buuxa
// (dashboard-ka). Hero-ga bogga ayaa wata magaca iskuulka iyo badhamada.
function OwnerLayout() {
  return (
    <div className="min-h-screen bg-canvas">
      <main className="mx-auto w-full max-w-7xl p-3 sm:p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default OwnerLayout
