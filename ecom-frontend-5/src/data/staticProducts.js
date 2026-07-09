export const staticProducts = [
  {
    id: "static-1",
    name: "Ultrabook Pro 14",
    brand: "Apex",
    description:
      "A slim everyday laptop with a bright display, fast storage, and enough battery life for work, study, and travel.",
    price: 1199,
    category: "Laptop",
    releaseDate: "2026-04-01",
    productAvailable: true,
    stockQuantity: 18,
    discountPercentage: 12,
    imageUrl:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
    source: "static",
  },
  {
    id: "static-2",
    name: "Studio Wireless Headphones",
    brand: "Pulse",
    description:
      "Comfortable over-ear headphones with active noise reduction, punchy audio, and all-day listening comfort.",
    price: 249,
    category: "Headphone",
    releaseDate: "2026-03-14",
    productAvailable: true,
    stockQuantity: 34,
    discountPercentage: 8,
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    source: "static",
  },
  {
    id: "static-3",
    name: "Edge Max Smartphone",
    brand: "Nova",
    description:
      "A clean, responsive phone with a sharp OLED screen, reliable cameras, and fast charging for busy days.",
    price: 899,
    category: "Mobile",
    releaseDate: "2026-02-20",
    productAvailable: true,
    stockQuantity: 27,
    discountPercentage: 10,
    imageUrl:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
    source: "static",
  },
  {
    id: "static-4",
    name: "Compact Mirrorless Camera",
    brand: "Frame",
    description:
      "A lightweight camera body for product shoots, travel photos, and crisp video without carrying a bulky kit.",
    price: 699,
    category: "Electronics",
    releaseDate: "2026-01-18",
    productAvailable: true,
    stockQuantity: 12,
    discountPercentage: 15,
    imageUrl:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
    source: "static",
  },
  {
    id: "static-5",
    name: "City Runner Sneakers",
    brand: "Stride",
    description:
      "Breathable daily sneakers with soft cushioning, a clean silhouette, and durable street-ready grip.",
    price: 129,
    category: "Fashion",
    releaseDate: "2026-05-08",
    productAvailable: true,
    stockQuantity: 42,
    discountPercentage: 5,
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    source: "static",
  },
  {
    id: "static-6",
    name: "Creative Builder Set",
    brand: "PlayLab",
    description:
      "A colorful building set with sturdy pieces for open-ended play, display builds, and quick weekend projects.",
    price: 59,
    category: "Toys",
    releaseDate: "2026-06-02",
    productAvailable: true,
    stockQuantity: 55,
    discountPercentage: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=900&q=80",
    source: "static",
  },
];

export const findStaticProductById = (productId) =>
  staticProducts.find((product) => String(product.id) === String(productId));

export const searchStaticProducts = (keyword) => {
  const normalizedKeyword = keyword.trim().toLowerCase();

  if (!normalizedKeyword) {
    return [];
  }

  return staticProducts.filter((product) =>
    [product.name, product.brand, product.category, product.description]
      .join(" ")
      .toLowerCase()
      .includes(normalizedKeyword)
  );
};
