# AI Agent Test Queries

## English Queries

### Basic Queries
- ✅ "Show me Hunza packages"
- ✅ "Find Swat tours"
- ✅ "I want to go to Naran"

### With Duration
- ✅ "2 day trip to Murree"
- ✅ "Weekend package to Hunza"
- ✅ "3 days in Swat"

### With Budget
- ✅ "Hunza under 20k"
- ✅ "Cheap Swat packages"
- ✅ "Budget friendly Naran tours under 15000"
- ✅ "Luxury Skardu package"

### Combined Criteria
- ✅ "2 day Hunza trip under 30k"
- ✅ "Weekend Swat package cheap"
- ✅ "3 days Naran tour for family under 50k"

### Travel Type
- ✅ "Family trip to Murree"
- ✅ "Adventure tour in Skardu"
- ✅ "Luxury package to Hunza"
- ✅ "Budget weekend to Swat"

## Urdu/Roman Urdu Queries

- ✅ "Hunza ke packages dikhao"
- ✅ "2 din ke liye Swat"
- ✅ "20 hazar ke andar Naran"
- ✅ "Sasta Murree package chahiye"
- ✅ "Family ke liye Hunza trip"
- ✅ "3 din ka Swat tour, 25k ke andar"

## Mixed Language

- ✅ "Show me sasta Hunza packages"
- ✅ "2 days Swat under 20 hazar"
- ✅ "Family trip batao Naran ke liye"

## Complex Queries

- ✅ "I'm looking for a budget-friendly 2-3 day package to Hunza for a family of 4, preferably under 40k"
- ✅ "Need a weekend getaway, somewhere scenic, not too expensive"
- ✅ "What luxury tours do you have for 5 days?"

## Refinement Queries

Query 1: "Show me Hunza packages"
Query 2: "Under 30k" (should refine previous query)

Query 1: "2 day tours"
Query 2: "To Swat" (should add destination to previous criteria)

## Edge Cases

- ✅ "Hello" (should return greeting)
- ✅ "Hi, I need help" (should return greeting)
- ✅ "Show me packages" (should ask for destination)
- ✅ "Trip" (too vague, should ask clarifying questions)

## Expected Behavior

### No Results
If no exact matches:
- Should suggest relaxed criteria
- Offer alternative destinations
- Suggest increasing budget

### Few Results (1-2)
- Should present them directly
- Highlight match score

### Many Results (3+)
- Should show top 5
- Display price range
- Show match indicators (🌟⭐✨)

## Response Language

- English query → English response
- Urdu query → Urdu response
- Mixed → English response with Urdu-friendly tone
