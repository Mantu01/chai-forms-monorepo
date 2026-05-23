"use client";

import React, { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore, useAppDispatch } from "~/lib/store";
import { trpc } from "~/trpc/client";
import { setUser, setUserLoading, setUserError } from "~/lib/features/userSlice";
import { setWorkspaces, setWorkspacesLoading, setWorkspacesError } from "~/lib/features/workspaceSlice";

function StoreSync() {
  const dispatch = useAppDispatch();

  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
  } = trpc.auth.me.useQuery();

  const userId = userData?.user?.id;

  const {
    data: workspacesData,
    isLoading: workspacesLoading,
    error: workspacesError,
  } = trpc.workspace.getUserWorkspaces.useQuery(
    {},
    {
      enabled: !!userId,
    }
  );

  useEffect(() => {
    dispatch(setUserLoading(userLoading));
    if (userData?.user) {
      dispatch(setUser(userData.user));
    } else if (!userLoading) {
      dispatch(setUser(null));
    }
    if (userError) {
      dispatch(setUserError(userError.message));
    }
  }, [userData, userLoading, userError, dispatch]);

  useEffect(() => {
    if (userId) {
      dispatch(setWorkspacesLoading(workspacesLoading));
      if (workspacesData) {
        dispatch(setWorkspaces(workspacesData as any[]));
      }
      if (workspacesError) {
        dispatch(setWorkspacesError(workspacesError.message));
      }
    } else if (!userLoading) {
      dispatch(setWorkspaces([]));
    }
  }, [workspacesData, workspacesLoading, workspacesError, userId, userLoading, dispatch]);

  return null;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <Provider store={storeRef.current}>
      <StoreSync />
      {children}
    </Provider>
  );
}
