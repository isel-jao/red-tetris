import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function LobbyPage() {
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const room = formData.get("room");
    const user = formData.get("user");

    if (!room || !user) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (room.length < 2 || user.length < 2) {
      toast.error("Room and user names must be at least 2 characters long.");
      return;
    }
    navigate(`/${room}/${user}`);
  }
  return (
    <main className="container grid place-content-center">
      <form
        onSubmit={handleSubmit}
        method="post"
        className="bg-card/50 border p-4 md:p-6 lg:p-8 backdrop-blur-md rounded-xl flex flex-col gap-2 w-[min(calc(100vw-2rem),24rem)]"
      >
        <h1 className="text-2xl">Join a Room</h1>
        <label htmlFor="room">Room</label>
        <input
          autoFocus
          type="text"
          placeholder="Insert room name"
          required
          min={2}
          name="room"
        />
        <label htmlFor="room">User</label>
        <input
          type="text"
          placeholder="Insert user name"
          required
          min={2}
          name="user"
        />
        <button className="filled mt-4">Join</button>
      </form>
    </main>
  );
}
