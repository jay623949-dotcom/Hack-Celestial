"""
Mock AI Client — Mockable interface to the AI Studio / Gemini layer.
Provides hardcoded example responses so backend development isn't blocked.
All responses mirror the exact schema the real AI client would return.
"""
import asyncio
import random
from typing import Optional

# ─── Guardrail Constants ────────────────────────────────────────────────────
CV_CONFIDENCE_CUTOFF = 0.6
RATE_CHANGE_CAP = 0.15


# ─── Persona/Sentiment Classification ───────────────────────────────────────
PERSONA_RESPONSES = {
    "business": {
        "persona_label": "Business",
        "value_tier": "Premium",
        "sentiment_state": "Neutral",
        "reasoning": "Guest transcript indicates efficiency focus, mentions work meetings and Wi-Fi priority. Classified as Business persona.",
    },
    "luxury": {
        "persona_label": "Luxury",
        "value_tier": "VIP",
        "sentiment_state": "Positive",
        "reasoning": "Guest language indicates high willingness to pay, interest in curated experiences. Classified as Luxury persona.",
    },
    "family": {
        "persona_label": "Family",
        "value_tier": "Standard",
        "sentiment_state": "Neutral",
        "reasoning": "Guest mentions children, family activities, flexible scheduling. Classified as Family persona.",
    },
    "frugal": {
        "persona_label": "Frugal",
        "value_tier": "Standard",
        "sentiment_state": "Neutral",
        "reasoning": "Guest language indicates price sensitivity, interest in value bundles. Classified as Frugal persona.",
    },
    "loyalist": {
        "persona_label": "Loyalist",
        "value_tier": "Premium",
        "sentiment_state": "Positive",
        "reasoning": "Repeat guest pattern detected. High lifetime value. Classified as Loyalist persona.",
    },
    "wellness": {
        "persona_label": "Wellness",
        "value_tier": "Premium",
        "sentiment_state": "Positive",
        "reasoning": "Guest mentions spa, yoga, health-conscious preferences. Classified as Wellness persona.",
    },
    "adventure": {
        "persona_label": "Adventure",
        "value_tier": "Standard",
        "sentiment_state": "Positive",
        "reasoning": "Guest mentions outdoor activities, excursions. Classified as Adventure persona.",
    },
    "bleisure": {
        "persona_label": "Bleisure",
        "value_tier": "Premium",
        "sentiment_state": "Neutral",
        "reasoning": "Guest combines business and leisure language. Classified as Bleisure persona.",
    },
}

AT_RISK_KEYWORDS = [
    "delay", "wait", "late", "slow", "disappointed", "problem", "issue",
    "frustrated", "unhappy", "terrible", "awful", "bad", "worst", "unacceptable",
    "wrong room", "noise", "broken", "not working", "cold", "dirty",
]

POSITIVE_KEYWORDS = [
    "great", "wonderful", "amazing", "excellent", "love", "perfect",
    "fantastic", "beautiful", "impressed", "happy", "satisfied",
]


async def classify_persona_sentiment(transcript: str, guest_history: Optional[dict] = None) -> dict:
    """
    Classify guest persona and sentiment from a voice transcript or text intake.
    Mock implementation returns keyword-matched results with fallback to Business persona.
    
    Real implementation: POST to Gemini/AI Studio with structured prompt.
    """
    await asyncio.sleep(0.1)  # Simulate API latency

    transcript_lower = transcript.lower()

    # Sentiment detection
    at_risk_score = sum(1 for kw in AT_RISK_KEYWORDS if kw in transcript_lower)
    positive_score = sum(1 for kw in POSITIVE_KEYWORDS if kw in transcript_lower)

    if at_risk_score >= 2:
        sentiment = "At-Risk"
    elif positive_score >= 2:
        sentiment = "Positive"
    else:
        sentiment = "Neutral"

    # Persona detection
    persona_key = "business"
    if any(kw in transcript_lower for kw in ["spa", "yoga", "wellness", "health", "meditation"]):
        persona_key = "wellness"
    elif any(kw in transcript_lower for kw in ["kids", "children", "family", "child"]):
        persona_key = "family"
    elif any(kw in transcript_lower for kw in ["budget", "cheap", "discount", "deal", "price"]):
        persona_key = "frugal"
    elif any(kw in transcript_lower for kw in ["suite", "luxury", "premium", "exclusive", "butler"]):
        persona_key = "luxury"
    elif any(kw in transcript_lower for kw in ["returning", "loyalty", "last time", "always stay"]):
        persona_key = "loyalist"
    elif any(kw in transcript_lower for kw in ["hiking", "adventure", "excursion", "outdoor"]):
        persona_key = "adventure"
    elif any(kw in transcript_lower for kw in ["meeting", "conference", "work", "business", "wifi", "quiet"]):
        persona_key = "business"
    elif any(kw in transcript_lower for kw in ["bleisure", "leisure", "working vacation"]):
        persona_key = "bleisure"

    result = dict(PERSONA_RESPONSES[persona_key])
    result["sentiment_state"] = sentiment
    result["confidence"] = round(random.uniform(0.82, 0.97), 3)
    return result


# ─── CV Triage ───────────────────────────────────────────────────────────────
CV_TRIAGE_RESPONSES = [
    {
        "identified_asset": "plumbing",
        "identified_asset_type": "plumbing",
        "visible_issue": "Water leak under sink, pipe joint visible corrosion",
        "severity": "high",
        "confidence_score": 0.91,
        "priority": "safety",
        "recommended_action": "Shut off water supply, replace corroded joint immediately",
        "reasoning": "CV analysis detected water pooling and corroded pipe joint. High confidence leak identification.",
    },
    {
        "identified_asset": "HVAC unit",
        "identified_asset_type": "hvac",
        "visible_issue": "Unusual ice buildup on evaporator coil",
        "severity": "medium",
        "confidence_score": 0.78,
        "priority": "guest-facing",
        "recommended_action": "Defrost cycle, check refrigerant levels, schedule service",
        "reasoning": "CV analysis detected ice accumulation pattern consistent with low refrigerant or blocked airflow.",
    },
    {
        "identified_asset": "electrical panel",
        "identified_asset_type": "electrical",
        "visible_issue": "Scorch marks on outlet cover, possible short circuit",
        "severity": "high",
        "confidence_score": 0.85,
        "priority": "safety",
        "recommended_action": "Cut power to circuit, do not allow guest occupancy, call licensed electrician",
        "reasoning": "CV detected thermal discoloration consistent with electrical arcing. Safety priority.",
    },
    {
        "identified_asset": "furniture",
        "identified_asset_type": "furniture",
        "visible_issue": "Torn upholstery on chair, cosmetic damage",
        "severity": "low",
        "confidence_score": 0.95,
        "priority": "cosmetic",
        "recommended_action": "Schedule furniture repair or replacement, lower booking tier for room",
        "reasoning": "CV classified damage as purely cosmetic, no structural or safety concern.",
    },
]


async def cv_triage(image_data: Optional[bytes] = None, description: str = "") -> dict:
    """
    Computer vision triage of maintenance issue from image.
    Mock returns a realistic CV response.
    
    Real implementation: POST image to Gemini Vision API.
    """
    await asyncio.sleep(0.15)  # Simulate CV API latency
    
    # Pick response based on description keywords if no image
    response = random.choice(CV_TRIAGE_RESPONSES)
    if description:
        desc_lower = description.lower()
        if any(kw in desc_lower for kw in ["leak", "water", "pipe", "flood"]):
            response = CV_TRIAGE_RESPONSES[0]
        elif any(kw in desc_lower for kw in ["hvac", "air", "cold", "heat", "temperature"]):
            response = CV_TRIAGE_RESPONSES[1]
        elif any(kw in desc_lower for kw in ["electric", "outlet", "power", "short", "spark"]):
            response = CV_TRIAGE_RESPONSES[2]
        elif any(kw in desc_lower for kw in ["furniture", "cosmetic", "scratch", "stain", "tear"]):
            response = CV_TRIAGE_RESPONSES[3]
    
    return dict(response)


# ─── Flash Sale Copy Generation ───────────────────────────────────────────────
OFFER_COPY_BY_PERSONA = {
    "Business": "⚡ Your 2 PM slot just opened: 90-min express spa + in-room dining. Delivered by 3 PM — before your evening call. Book now.",
    "Luxury": "✨ An exclusive spa hour has become available — champagne awaits. Reserve your private suite for an afternoon of indulgence.",
    "Family": "🌟 Family fun just got better! Grab the 2 PM pool cabana + kids' activity package — perfect for today's afternoon.",
    "Frugal": "💰 Flash Deal: 40% off spa access today only, 2–4 PM. Value bundle includes towel service and refreshments.",
    "Loyalist": "🎉 A special thank-you: your preferred spa time is open. We've held it specifically because you're a valued returning guest.",
    "Wellness": "🧘 Your 2 PM wellness window is open — signature deep-tissue massage + aromatherapy session. Limited availability.",
    "Adventure": "🏄 Afternoon adventure package: kayak rental + guided trail, departing at 2:30 PM. Last spots available.",
    "Bleisure": "☀️ Wind down early: 2 PM spa slot + poolside work-friendly zone with Wi-Fi. Perfect balance before tonight.",
}


async def generate_offer_copy(persona_label: str, offer_description: str) -> dict:
    """
    Generate persona-framed marketing copy for a flash sale offer.
    
    Real implementation: POST to Gemini with persona + offer context.
    """
    await asyncio.sleep(0.1)
    
    copy = OFFER_COPY_BY_PERSONA.get(
        persona_label,
        f"🎁 Limited time: {offer_description}. Available for a short window — act now!"
    )
    
    return {
        "persona_label": persona_label,
        "offer_copy": copy,
        "channel": "in-app push + front desk notification",
        "reasoning": f"Copy calibrated for {persona_label} persona: emphasizes {_persona_emphasis(persona_label)}.",
    }


def _persona_emphasis(persona: str) -> str:
    mapping = {
        "Business": "speed and productivity",
        "Luxury": "exclusivity and indulgence",
        "Family": "convenience and kid-friendliness",
        "Frugal": "value and savings",
        "Loyalist": "recognition and personalization",
        "Wellness": "health and serenity",
        "Adventure": "experience and activity",
        "Bleisure": "balance of work and leisure",
    }
    return mapping.get(persona, "personalized value")
