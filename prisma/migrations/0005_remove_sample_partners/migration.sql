-- Remove the placeholder partners that were seeded before real partners signed on.
DELETE FROM "Vendor" WHERE "slug" IN ('striper-charter','sunset-cruise','hillside-vineyard','red-river-trail-rides','lakeside-steakhouse','private-chef','casino-resort','in-home-massage');
