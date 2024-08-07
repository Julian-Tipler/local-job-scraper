import { supabase } from "./clients/supabase.ts";
import { stripe } from "./clients/stripe.ts";

export const createStripeMeterEvent = async ({
  copilotId,
  tokens,
}: {
  copilotId: string;
  tokens: number;
}): Promise<void> => {
  try {
    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("stripeCustomerId")
      .eq("copilotId", copilotId)
      .single();

    if (subscriptionError || !subscription.stripeCustomerId) {
      console.error("Error fetching subscription", subscriptionError);
      throw new Error("Error fetching subscription");
    }

    // Create a meter event in Stripe to record usage of OpenAI tokens
    const meterEvent = await stripe.billing.meterEvents.create({
      event_name: "cost_units",
      payload: {
        value: tokens,
        stripe_customer_id: subscription.stripeCustomerId,
      },
    });

    console.info(meterEvent);
  } catch (error) {
    console.error("Error creating stripe meter event", error);
  }
};
