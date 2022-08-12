// https://www.tunglt.com/2018/11/bo-dau-tieng-viet-javascript-es6/
export const formatAccountName = (name: string) =>
  name
    ? name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .replace(/[^a-zA-Z_\d]/g, "")
        .toLowerCase()
    : "";
