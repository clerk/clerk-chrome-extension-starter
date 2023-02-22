import React from "react";
import Clerk from "@clerk/clerk-js";
import {
  type ClerkProviderProps as ClerkReactProviderProps,
  ClerkProvider as ClerkReactProvider,
  ClerkProp,
} from "@clerk/clerk-react";

export interface TokenCache {
  getToken: (key: string) => Promise<string | undefined | null>;
  saveToken: (key: string, token: string) => Promise<void>;
}

const KEY = "__clerk_client_jwt";

// Use chrome.storage (local or sync) to persist Clerk client JWT.
// More information athttps://developer.chrome.com/docs/extensions/reference/storage
const createChromeStorageCache = (): TokenCache => {
  return {
    saveToken: (key: string, token: string) => {
      return chrome.storage.local.set({ [key]: token });
    },
    getToken: (key: string) => {
      return chrome.storage.local.get(key).then((result) => {
        return result[key];
      });
    },
  };
};

function convertPublishableKeyToFrontendAPIOrigin(key = "") {
  return `https://${atob(key.replace(/pk_(test|live)_/, "")).slice(0, -1)}`;
}

export let clerk: ClerkProp;

type BuildClerkOptions = {
  key: string;
  tokenCache: TokenCache;
};

export async function buildClerk({
  key,
  tokenCache,
}: BuildClerkOptions): Promise<ClerkProp> {
  if (!clerk) {
    const getToken = tokenCache.getToken;
    const saveToken = tokenCache.saveToken;

    console.log(`Clerk: ${key}`);

    const clerkFrontendAPIOrigin =
      convertPublishableKeyToFrontendAPIOrigin(key);

    console.log(`Clerk: Getting cookie for ${clerkFrontendAPIOrigin}...`);
    const clientCookie = await chrome.cookies.get({
      url: clerkFrontendAPIOrigin,
      name: "__client",
    });

    // TODO: Listen to client cookie changes and sync updates
    // https://developer.chrome.com/docs/extensions/reference/cookies/#event-onChanged

    if (clientCookie) {
      console.log("Clerk: Found client cookie from website");
      saveToken(KEY, clientCookie.value);
    }

    clerk = new Clerk(key);

    // @ts-expect-error
    clerk.__unstable__onBeforeRequest(async (requestInit) => {
      requestInit.credentials = "omit";

      requestInit.url?.searchParams.append("_is_native", "1");

      const jwt = await getToken(KEY);
      (requestInit.headers as Headers).set("authorization", jwt || "");
    });

    // @ts-expect-error
    clerk.__unstable__onAfterResponse(async (_, response) => {
      const authHeader = response.headers.get("authorization");
      if (authHeader) {
        await saveToken(KEY, authHeader);
      }
    });
  }

  return clerk;
}

export type ClerkProviderProps = ClerkReactProviderProps & {
  children: React.ReactNode;
  tokenCache?: TokenCache;
};

export function ClerkProvider(props: ClerkProviderProps): JSX.Element | null {
  const { children, publishableKey, ...rest } = props;

  const [clerkInstance, setClerkInstance] = React.useState<ClerkProp>(null);

  React.useEffect(() => {
    (async () => {
      console.log("Clerk: Building instance...");
      setClerkInstance(
        await buildClerk({
          key: publishableKey || "",
          tokenCache: createChromeStorageCache(),
        })
      );
    })();
  }, []);

  if (!clerkInstance) {
    return null;
  }

  return (
    //@ts-expect-error
    <ClerkReactProvider {...rest} Clerk={clerkInstance} standardBrowser={false}>
      {children}
    </ClerkReactProvider>
  );
}
