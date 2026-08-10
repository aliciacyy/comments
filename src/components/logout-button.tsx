"use client";

export default function LogoutButton() {
  async function logout() {
    await fetch("/api/home-logout", { method: "POST" });
    window.location.reload();
  }

  return <button className="logout-button" type="button" onClick={logout}>Lock generator</button>;
}
