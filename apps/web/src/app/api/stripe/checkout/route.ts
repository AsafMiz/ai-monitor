import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { workspace_id } = await request.json();

  // Get workspace
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspace_id)
    .single();

  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }

  // Create or reuse Stripe customer
  let customerId = workspace.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { workspace_id, user_id: user.id },
    });
    customerId = customer.id;
    await supabase
      .from('workspaces')
      .update({ stripe_customer_id: customerId })
      .eq('id', workspace_id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID!,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?checkout=canceled`,
    metadata: { workspace_id },
  });

  return NextResponse.json({ url: session.url });
}
