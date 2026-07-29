const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface CartCheckoutParams {
  items: { productId: number; quantity: number }[];
  shippingAddress?: string;
}

export async function validateCart(_params: CartCheckoutParams): Promise<{ valid: boolean; message?: string }> {
  await delay(300);
  return { valid: true };
}
