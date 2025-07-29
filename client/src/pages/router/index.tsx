import { BrowserRouter, Routes, Route } from "react-router";
import GamePage from "../game";
import LobbyPage from "../lobby";
import Layout from "../layout";
import NotFoundPage from "../not-found";
export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<LobbyPage />} />
          <Route path="/:room/:user" element={<GamePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
