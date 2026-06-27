import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import MarketPage from "./pages/MarketPage";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={MarketPage} />
      <Route>
        <div className="min-h-screen w-full flex items-center justify-center bg-[#050818] text-white">
          <h1 className="text-2xl font-bold">404 - Страница не найдена</h1>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
      <Toaster position="top-center" theme="dark" />
    </QueryClientProvider>
  );
}

export default App;
