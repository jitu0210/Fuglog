import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PostPage from './pages/PostPage';
import CreatePostPage from './pages/CreatePostPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import GuidelinesPage from './pages/GuidelinesPage';
import MyRoomsPage from './pages/MyRoomsPage';
import CreateRoomPage from './pages/CreateRoomPage';
import RoomDetailPage from './pages/RoomDetailPage';
import JoinRoomPage from './pages/JoinRoomPage';
import SearchRoomsPage from './pages/SearchRoomsPage';
import RoomRequestsPage from './pages/RoomRequestsPage';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* no-op */ }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} onLogout={() => setUser(null)} />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage user={user} />} />
          <Route path="/posts/:id" element={<PostPage user={user} />} />
          <Route path="/create" element={<CreatePostPage user={user} />} />
          <Route path="/edit/:id" element={<CreatePostPage user={user} />} />
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          <Route path="/register" element={<RegisterPage setUser={setUser} />} />
          <Route path="/profile/:id" element={<ProfilePage user={user} setUser={setUser} />} />
          <Route path="/settings" element={<EditProfilePage user={user} setUser={setUser} />} />
          <Route path="/guidelines" element={<GuidelinesPage />} />
          <Route path="/rooms" element={<MyRoomsPage user={user} />} />
          <Route path="/rooms/create" element={<CreateRoomPage user={user} />} />
          <Route path="/rooms/join" element={<JoinRoomPage user={user} />} />
          <Route path="/rooms/search" element={<SearchRoomsPage user={user} />} />
          <Route path="/rooms/:code/requests" element={<RoomRequestsPage user={user} />} />
          <Route path="/rooms/:code" element={<RoomDetailPage user={user} />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
