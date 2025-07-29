import React from "react";
import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <main className="container text-lg  gap-4 flex-col flex items-center justify-center">
      <h1 className="text-2xl font-bold ">404 - Page Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <div>
        You can go back to the <Link to="/" className="capitalize ml-2 hover:underline text-blue-500">home page</Link>.
      </div>
    </main>
  );
}
