export const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with a single hyphen
      .replace(/[^\w-]+/g, "") // Remove invalid characters
      .replace(/--+/g, "-"); // Replace multiple hyphens with a single one
  };
  