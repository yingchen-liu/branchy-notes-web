import { v4 as uuidv4 } from "uuid";
import "semantic-ui-css/semantic.min.css";
import "../main.css";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addChildNode,
  updateNodeById,
  updateNodes,
} from "../reducers/skillTreeUtils";
import { TreeItem, TreeItemPlaceholder } from "../types/skillTree";
import {
  SkillTreeContext,
  useSkillTreeContext,
} from "../contexts/SkillTreeContext";
import HeaderMenu from "../components/Common/HeaderMenu";
import TreeNodeEditor from "../components/Tree/Editor/TreeNodeEditor";
import TreeView from "../components/Tree/TreeView";
import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import TreeBottomBar from "../components/Tree/Editor/TreeBottomBar";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { updateToken } from "../services/services";
import { getUserById, login, updateUser } from "../services/userService";
import { createTreeNotesTitle } from "../utils/title";
import { t } from "i18next";
import OnBoarding from "../components/Tree/OnBoarding";
import {
  fetchNodeChildren,
  fetchRootNode,
  loadQueueFromStorage,
  mutex,
  OperationType,
  queueOperation,
  saveQueueToStorage,
} from "../services/skillTreeService";
import { Button } from "../components/Index/Section";
import LoadingSpinner from "../components/Common/Loader";
import HorizontalScroll from "../components/Layout/HorizontalScroll";

export default function MyTreeNotes() {
  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (userId === "yingchen-liu") {
      navigate(
        "/u/google-oauth2%7C109648791259742005616",
        { replace: true }
      );
    }
  }, [userId, navigate]); // Dependency array ensures effect runs when userId or navigate changes

  const { user, isLoading, isAuthenticated, getAccessTokenSilently } =
    useAuth0();
  const { i18n } = useTranslation();
  const { state, dispatch, selectedLeafRef } = useSkillTreeContext();
  const queryClient = useQueryClient();
  const [showOnBoardingModal, setShowOnBoardingModal] =
    useState<boolean>(false);
  const [isOnBoardingModalLoading, setOnBoardingModalLoading] =
    useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isIniting, setIniting] = useState(true);

  useEffect(() => {
    document.title = state.title ? state.title : t("myTreeNotesTitle");
    document.body.style.backgroundColor = "#1f2937";
  }, [state.title]);

  const { data, isPending, isSuccess, refetch } = useQuery({
    queryKey: ["skill-tree"],
    queryFn: () => fetchRootNode(userId || "", i18n.language),
    enabled: false,
  });

  const init = async () => {
    setIniting(true);
    try {
      const token = await getAccessTokenSilently();
      updateToken(token);
    } catch (error) {
      updateToken(undefined);
    }
    if (user) {
      try {
        const currentUser = await login();
        if (!currentUser.given_name) {
          setShowOnBoardingModal(true);
        } else {
          setIniting(false);
          fetchTree();
        }
      } catch (error) {
        setIniting(false);
        setError(t("failedToLoad"));
      }
    } else {
      setIniting(false);
      fetchTree();
    }
  };

  useEffect(() => {
    if (!isLoading) {
      // Wait for auth status to be determined
      init();
    }
  }, [isLoading, isAuthenticated, queryClient]); // Depend on authentication status and loading state

  async function fetchTree() {
    try {
      if (userId) {
        const ownerUserInfo = await getUserById(userId);
        dispatch({
          type: "title/update",
          title: createTreeNotesTitle(undefined, ownerUserInfo),
        });
        dispatch({ type: "ownerUser/update", ownerUser: ownerUserInfo });
      }
      await refetch();
      setError(null); // Reset error if data fetch is successful
    } catch (e) {
      setError(t("failedToLoad")); // Set error message
    }
  }

  const doUpdateNode = (node: TreeItem) => {
    queryClient.setQueryData(
      ["skill-tree"],
      (existingData: Record<string, TreeItem | TreeItemPlaceholder>) => {
        return updateNodeById(existingData, node.uuid, node);
      }
    );
    queueOperation("updateNode", { node, fieldsToRemove: ["children"] });
  };

  async function handleLoadMore(node: TreeItem) {
    if (node.children.length !== 0) {
      queryClient.setQueryData(
        ["skill-tree"],
        (existingData: Record<string, TreeItem | TreeItemPlaceholder>) => {
          return updateNodeById(existingData, node.uuid, {
            ...node,
            isCollapsing: false,
          });
        }
      );
      return;
    }

    const placeholderUuid = uuidv4();
    queryClient.setQueryData(
      ["skill-tree"],
      (existingData: Record<string, TreeItem | TreeItemPlaceholder>) => {
        return updateNodeById(
          addChildNode(existingData, node.uuid, {
            uuid: placeholderUuid,
            isError: false,
          }),
          node.uuid,
          {
            ...node,
            isCollapsing: false,
          }
        );
      }
    );

    try {
      const result = await fetchNodeChildren(userId || "", node.uuid);

      queryClient.setQueryData(
        ["skill-tree"],
        (existingData: Record<string, TreeItem | TreeItemPlaceholder>) => {
          return updateNodeById(updateNodes(existingData, result), node.uuid, {
            ...node,
            isCollapsing: false,
          });
        }
      );
    } catch (e) {
      queryClient.setQueryData(
        ["skill-tree"],
        (existingData: Record<string, TreeItem | TreeItemPlaceholder>) => {
          return updateNodeById(existingData, placeholderUuid, {
            uuid: placeholderUuid,
            isError: true,
          });
        }
      );
    }
  }

  function handleCollapse(node: TreeItem) {
    queryClient.setQueryData(
      ["skill-tree"],
      (existingData: Record<string, TreeItem | TreeItemPlaceholder>) => {
        return updateNodeById(existingData, node.uuid, {
          ...node,
          isCollapsing: true,
        });
      }
    );
  }

  // Retry fetching the tree
  const handleRetry = () => {
    setError(null); // Clear error message
    init(); // Retry fetching data
  };

  const [syncState, setSyncState] = useState("complete");

  useEffect(() => {
    // Function to fetch data from localStorage
    const fetchRequestQueue = () => {
      const { requestQueue } = loadQueueFromStorage();
      const isOffline = localStorage.getItem("isOffline") === "true";

      if (isOffline) {
        setSyncState("offline");
      } else if (requestQueue.length > 0) {
        if (requestQueue[0].retries >= 3) {
          setSyncState("error");
        } else {
          setSyncState("syncing");
        }
      } else {
        setSyncState("complete");
      }
    };

    // Initial fetch
    fetchRequestQueue();

    // Set an interval to fetch data every 1s
    const intervalId = setInterval(fetchRequestQueue, 1000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const [syncErrorModal, setSyncErrorModal] = useState<{
    nodeName: string;
    type: OperationType;
  } | null>(null);

  useEffect(() => {
    if (syncState === "error") {
      const item = loadQueueFromStorage().requestQueue[0];
      setSyncErrorModal({
        nodeName: item.params.node?.name || "Unknwon Notes",
        type: item.operationType,
      });
    } else {
      setSyncErrorModal(null);
    }
  }, [syncState]);

  const handleRetrySync = async () => {
    await mutex.runExclusive(async () => {
      const { requestQueue } = loadQueueFromStorage();
      requestQueue[0].retries = 0;
      saveQueueToStorage(requestQueue);
    });
    setSyncErrorModal(null);
  };

  const handleSkipSync = async () => {
    await mutex.runExclusive(async () => {
      const { requestQueue } = loadQueueFromStorage();
      requestQueue.shift();
      saveQueueToStorage(requestQueue);
    });
    setSyncErrorModal(null);
  };

  return (
    <>
      {syncErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md text-center">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {t("syncErrorTitle")}
            </h2>
            <p className="text-gray-600 mb-6">
              {t("failedTo")}
              {syncErrorModal.type.startsWith("create")
                ? t("create")
                : syncErrorModal.type === "moveNode"
                ? t("move")
                : syncErrorModal.type === "updateNode"
                ? t("edit")
                : syncErrorModal.type === "deleteNode"
                ? t("delete")
                : t("modify")}{" "}
              <b>{syncErrorModal.nodeName}</b>.{t("syncErrorDescription")}
            </p>
            <div className="flex justify-center space-x-4">
              <Button reverse={true} onClick={handleRetrySync}>
                {t("retry")}
              </Button>
              <Button
                reverse={true}
                className="border-red-500 text-red-500 hover:border-red-700 hover:text-red-700"
                onClick={handleSkipSync}
              >
                {t("skip")}
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className={`container--full-screen lang-${i18n.language}`}>
        <HeaderMenu
          activeItem="my-tree-notes"
          title={
            "🌲 " +
            createTreeNotesTitle(undefined, state.ownerUser || undefined)
          }
        />
        {!error && (
          <>
            {showOnBoardingModal ? (
              <OnBoarding
                handleUpdateName={async function (
                  firstName: string,
                  lastName?: string,
                  nickname?: string
                ) {
                  if (!user?.sub) {
                    throw new Error(
                      "Could not update user: No user id specified"
                    );
                  }

                  setOnBoardingModalLoading(true);

                  try {
                    await updateUser(
                      user?.sub,
                      {
                        given_name: firstName,
                        family_name: lastName,
                        nickname: nickname,
                      },
                      i18n.language
                    );

                    setShowOnBoardingModal(false);
                    setIniting(false);
                    await fetchTree();
                  } catch (e) {
                    setShowOnBoardingModal(true);
                    setOnBoardingModalLoading(false);
                  }
                }}
                loading={isOnBoardingModalLoading}
              />
            ) : (
              <SkillTreeContext.Provider
                value={{
                  state,
                  selectedLeafRef,
                  dispatch,
                  treeData: {
                    data,
                    isPending,
                    isSuccess,
                    updateNode: doUpdateNode,
                  },
                  handleLoadMore,
                  handleCollapse,
                }}
              >
                {isIniting ? (
                  <HorizontalScroll className="body--full-screen">
                    <div className="mt-40">
                      <LoadingSpinner
                        size="lg"
                        dark={false}
                        message={t("initing")}
                      />
                    </div>
                  </HorizontalScroll>
                ) : (
                  <TreeView />
                )}

                {state.selectedNode && <TreeNodeEditor />}

                {userId === user?.sub && !isPending && <TreeBottomBar />}
              </SkillTreeContext.Provider>
            )}
          </>
        )}

        {error && (
          <div className="mt-40 text-white m-auto text-center">
            <p className="mb-10 text-lg">{error}</p>
            <Button onClick={handleRetry}>{t("retry")}</Button>
          </div>
        )}
      </div>
    </>
  );
}
