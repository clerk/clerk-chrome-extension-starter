import React from "react";
import "./App.css";
import {
  SignedIn,
  SignedOut,
  SignIn,
  useAuth,
  useUser,
  useClerk,
} from "@clerk/clerk-react";
import { ClerkProvider } from "./ClerkProvider";

function HelloUser() {
  const { isSignedIn, user } = useUser();
  const { getToken, signOut } = useAuth();
  const clerk = useClerk();

  const [sessionToken, setSessionToken] = React.useState("");

  React.useEffect(() => {
    const scheduler = setInterval(async () => {
      const token = await getToken();
      setSessionToken(token as string);
    }, 1000);

    return () => clearInterval(scheduler);
  }, []);

  if (!isSignedIn) {
    return null;
  }

  return (
    <div>
      <p>Hi, {user.primaryEmailAddress?.emailAddress}!</p>
      <p>Clerk Session Token: {sessionToken}</p>
      <p>
        <button onClick={() => signOut()}>Sign out</button>
      </p>
    </div>
  );
}

function App() {
  const publishableKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY || "";

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <div className="App">
        <header className="App-header">
          <p>Welcome to Clerk Chrome Extension Starter!</p>
          <a
            className="App-link"
            href="https://clerk.dev/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn more about Clerk
          </a>
        </header>
        <main className="App-main">
          <SignedOut>
            <SignIn />
          </SignedOut>
          <SignedIn>
            <HelloUser />
          </SignedIn>
        </main>
      </div>
    </ClerkProvider>
  );
}

export default App;
