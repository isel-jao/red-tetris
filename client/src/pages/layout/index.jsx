import { Outlet } from "react-router";
import { Toaster } from "sonner";
import { SocketConfig } from "../../components/socket-config";

export default function Layout() {
  return (
    <SocketConfig url={"http://localhost:3000"} options={{}}>
      <main
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/bg.jpg')",
          backgroundSize: "100% 100%, cover",
        }}
      >
        <Outlet />
        <Toaster />
      </main>
    </SocketConfig>
  );
}
