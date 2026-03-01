"""Stripe billing service."""

import stripe
from src.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY


def create_customer(email: str, name: str | None = None) -> str:
    """Create a Stripe customer and return the customer ID."""
    customer = stripe.Customer.create(email=email, name=name)
    return customer.id


def create_checkout_session(
    customer_id: str,
    price_id: str,
    success_url: str,
    cancel_url: str,
) -> str:
    """Create a Stripe Checkout session and return the URL."""
    session = stripe.checkout.Session.create(
        customer=customer_id,
        payment_method_types=["card"],
        line_items=[{"price": price_id, "quantity": 1}],
        mode="subscription",
        success_url=success_url,
        cancel_url=cancel_url,
    )
    return session.url


def create_portal_session(customer_id: str, return_url: str) -> str:
    """Create a Stripe Customer Portal session and return the URL."""
    session = stripe.billing_portal.Session.create(
        customer=customer_id,
        return_url=return_url,
    )
    return session.url
