import { BrowserRouter, Routes, Route } from "react-router";
import GamePage from "../game";
import LobbyPage from "../lobby";
import Layout from "../layout";
export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<LobbyPage />} />
          <Route path="/:room/:user" element={<GamePage />} />
          <Route path="*" element={<main>404</main>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
