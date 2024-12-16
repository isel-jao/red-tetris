import { useParams } from "react-router";

export default function PlayerPage() {
  const { room, playerName } = useParams<{
    room: string;
    playerName: string;
  }>();
  return (
    <main className="container ">
      <h3 className="grid grid-cols-2  py-4 border-b">
        <div>Room: {room}</div>
        <div>Player: {playerName}</div>
      </h3>
    </main>
  );
}
