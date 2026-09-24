import { useEffect, useState } from "react";
import { api } from "./lib/api";
import { useAuth } from "./hooks/useAuth";
import { AppShell } from "./components/AppShell";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import TicketsPage from "./pages/TicketsPage";
import NewTicketPage from "./pages/NewTicketPage";
import UsersPage from "./pages/UsersPage";

export default function App() {
  const auth = useAuth();
  const [page, setPage] = useState("dashboard");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      auth.setLoading(false);
      return;
    }

    api("/auth/me")
      .then(data => auth.setUser(data.user))
      .catch(() => {
        localStorage.removeItem("token");
        auth.setUser(null);
      })
      .finally(() => auth.setLoading(false));
  }, []);

  if (auth.loading) return <div className="screen-loader"><div className="spinner" /><span>Loading EduSupport…</span></div>;

  if (!auth.user) {
    return <LoginPage onAuthenticated={user => {
      auth.setUser(user);
      setPage("dashboard");
    }} />;
  }

  const changed = () => setRefresh(value => value + 1);

  let content;
  if (page === "tickets") {
    content = <TicketsPage user={auth.user} refresh={refresh} onChanged={changed} />;
  } else if (page === "new" && auth.user.role === "student") {
    content = <NewTicketPage onDone={() => { changed(); setPage("tickets"); }} />;
  } else if (page === "users" && auth.user.role === "admin") {
    content = <UsersPage />;
  } else {
    content = <DashboardPage user={auth.user} refresh={refresh} onOpenTickets={() => setPage("tickets")} />;
  }

  return (
    <AppShell
      user={auth.user}
      page={page}
      onNavigate={setPage}
      onLogout={auth.logout}
    >
      {content}
    </AppShell>
  );
}
