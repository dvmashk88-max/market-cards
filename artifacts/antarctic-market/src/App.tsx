import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import HomePage from "./pages/HomePage";
import OfertaPage from "./pages/OfertaPage";
import PrivacyPage from "./pages/PrivacyPage";
import PersonalDataPage from "./pages/PersonalDataPage";
import TermsPage from "./pages/TermsPage";
import RefundPage from "./pages/RefundPage";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/oferta" component={OfertaPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/personal-data" component={PersonalDataPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/refund" component={RefundPage} />
      <Route>
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#05080f] text-white">
          <h1 className="text-3xl font-bold mb-4">404 - Страница не найдена</h1>
          <a href="/" className="text-blue-400 hover:underline">Вернуться на главную</a>
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
