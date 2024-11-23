import { t } from "i18next";
import { TreeItem } from "../types/skillTree";
import i18n from "../i18n";

export function createTreeNotesTitle(node?: TreeItem, ownerUserInfo?: User) {
  return (
    (node
      ? (node.linkTo
          ? `Link to ${node.linkTo.name}`
          : node.name || t("untitledNote")) + " | "
      : "") +
    (ownerUserInfo
      ? `${
          ownerUserInfo.given_name
            ? ownerUserInfo.nickname
              ? ownerUserInfo.nickname
              : i18n.language.startsWith("zh")
              ? ownerUserInfo.name
              : ownerUserInfo.given_name
            : ownerUserInfo.email
        }${t("sTreeNotesTitle")}`
      : t("myTreeNotesTitle"))
  );
}
