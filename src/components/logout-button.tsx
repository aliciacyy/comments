"use client";

export default function LogoutButton() {
  async function logout() {
    await fetch("/api/admin-logout", { method: "POST" });
    window.location.reload();
  }

  return <button className="logout-button" type="button" onClick={logout}>Lock admin</button>;
}
