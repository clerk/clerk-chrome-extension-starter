import "./App.css";

import {
  SignedIn,
  SignedOut,
  SignIn,
  useClerk,
  useUser,
  ClerkProvider,
} from "@clerk/chrome-extension";

function HelloUser() {
  const { isSignedIn, user } = useUser();
  const clerk = useClerk();

  if (!isSignedIn) {
    return null;
  }

  return (
    <>
      <p>Hi, {user.primaryEmailAddress?.emailAddress}!</p>
      <p>
        <button onClick={() => clerk.signOut()}>Sign out</button>
      </p>
    </>
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
