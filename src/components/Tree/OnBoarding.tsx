import { useState } from "react";
import { Button } from "../Index/Section";
import { t } from "i18next";
import LoadingSpinner from "../Common/Loader";

export default function OnBoarding({
  handleUpdateName,
  loading,
}: {
  handleUpdateName: (
    firstName: string,
    lastName?: string,
    nickname?: string
  ) => void;
  loading: boolean;
}) {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-8 shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {t("onBoarding.welcome")}
        </h2>
        <p className="text-gray-600 mb-6">{t("onBoarding.setupPrompt")}</p>
        <form>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700">
              {t("onBoarding.firstNameLabel")}
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              disabled={loading}
              maxLength={20}
              placeholder={t("onBoarding.firstNamePlaceholder")}
            />
          </div>
          <div className="mb-10">
            <label className="block text-sm font-medium text-gray-700">
              {t("onBoarding.lastNameLabel")}
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              maxLength={20}
              disabled={loading}
              className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder={t("onBoarding.lastNamePlaceholder")}
            />
          </div>
          <div className="mb-10">
            <label className="block text-sm font-medium text-gray-700">
              {t("onBoarding.nicknameLabel")}
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              disabled={loading}
              className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder={t("onBoarding.nicknamePlaceholder")}
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={(e: Event) => {
                e.preventDefault();
                if (loading) return;
                if (firstName) {
                  handleUpdateName(
                    firstName.trim(),
                    lastName.trim() ? lastName.trim() : undefined,
                    nickname.trim() ? nickname.trim() : undefined
                  );
                }
              }}
              className="flex gap-5"
              reverse={true}
              disabled={!firstName || loading}
            >
              {t("onBoarding.getStarted")}{" "}
              {loading && <LoadingSpinner message="" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
