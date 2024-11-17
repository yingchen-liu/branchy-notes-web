import { motion } from "framer-motion";
import { Button } from "../components/Index/Section";
import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { saveRedirectPath } from "../utils/auth";
import LanguageSwitcher from "../components/Common/Languages";
import { useTranslation } from "react-i18next"; // Importing the i18next hook

function GoToMyTreeNotesButton() {
  const { user, loginWithRedirect } = useAuth0();
  const { t } = useTranslation(); // Use t function for translation

  return (
    <>
      {user?.sub ? (
        <Button
          href={`/u/${user.sub}`}
          className="mb-4"
          inNewTab={false}
        >
          {t("landing.buttonMyTreeNotes")}
        </Button>
      ) : (
        <Button
          onClick={() => {
            saveRedirectPath("/u/${userId}");
            loginWithRedirect();
          }}
        >
          {t("landing.buttonGetTreeNotes")}
        </Button>
      )}
    </>
  );
}

export default function TreeNotes() {
  const { t } = useTranslation(); // Use t function for translation

  useEffect(() => {
    document.title = t("landing.title"); // Use t for title translation
    document.body.style.backgroundColor = "#1f2937";
  }, [t]);

  return (
    <>
      <div className="fixed top-2 right-4">
        <LanguageSwitcher />
      </div>
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 text-blue-100">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 md:px-10 py-10">
          <motion.div
            className="text-center mb-20 sm:mb-36 mt-10 sm:mt-20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="text-5xl font-extrabold text-white mb-10">
              <h1 className="mb-4">
                <img src="/images/logo-no-bg.png" className="w-20 inline-block mr-4 pb-4" />
                {t("landing.header")}
              </h1>
              <h1 className="mb-10">{t("landing.subheader")}</h1>
            </div>
            <div className="text-2xl mb-16">
              <p className="mb-2">{t("landing.intro.line1")}</p>
              <p className="mb-2">{t("landing.intro.line2")}</p>
              <p>{t("landing.intro.line3")}</p>
            </div>
            <div className="text-center">
              <GoToMyTreeNotesButton />
            </div>
          </motion.div>
        </div>

        <div className="mx-auto max-w-5xl px-5 sm:px-6 md:px-10 py-10 flex justify-center items-center">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
            className="text-2xl"
          >
            <p className="text-center mb-6 px-4">{t("landing.about.text1")}</p>
            <img
              src={"/images/tree-notes-food.png"}
              alt={t("landing.treeStructureExample")}
              className="w-full rounded-lg shadow-xl transition-transform mb-6 hover:scale-105"
            />
            <p className="text-center px-4">{t("landing.about.text2")}</p>
          </motion.div>
        </div>

        <div className="mx-auto max-w-5xl px-5 sm:px-6 md:px-10 py-10">
          <motion.h2
            className="text-3xl font-bold text-white mb-4 sm:mb-6"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {t("landing.features.header")}
          </motion.h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {[
              {
                img: "tree-notes-poached-egg.png",
                title: t("landing.features.richTextEditor.title"),
                desc: t("landing.features.richTextEditor.desc"),
              },
              {
                img: "tree-notes-link.png",
                title: t("landing.features.linkBetweenNodes.title"),
                desc: t("landing.features.linkBetweenNodes.desc"),
              },
              {
                img: "tree-notes-box.png",
                title: t("landing.features.groupNotes.title"),
                desc: t("landing.features.groupNotes.desc"),
              },
              {
                img: "tree-notes-color.png",
                title: t("landing.features.personalisation.title"),
                desc: t("landing.features.personalisation.desc"),
              },
            ].map((item, index) => (
              <motion.li
                key={item.img}
                className="p-3 sm:p-5 bg-gray-700 rounded-lg shadow-md"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.4 }}
              >
                <img
                  src={`/images/${item.img}`}
                  className="mb-3 transition-transform"
                />
                <strong>{item.title}</strong>
                <p>{item.desc}</p>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="mx-auto max-w-5xl px-5 sm:px-6 md:px-10 py-10">
          <motion.h2
            className="text-3xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {t("landing.whyTreeNotes.header")}
          </motion.h2>
          <p className="leading-relaxed px-4 text-2xl">
            {t("landing.whyTreeNotes.description")}
          </p>

          <motion.div
            className="text-center mt-20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <GoToMyTreeNotesButton />
          </motion.div>
        </div>
      </div>
    </>
  );
}
