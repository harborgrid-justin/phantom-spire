// API routes for threat intelligence
import { NextRequest, NextResponse } from 'next/server';
import { threatIntelligence } from '@/lib/threat-intelligence';

// GET /api/threat-intelligence - Get threat intelligence summary
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'summary':
        const summary = await threatIntelligence.getThreatSummary();
        return NextResponse.json(summary);

      case 'trending':
        const trending = await threatIntelligence.getTrendingThreats();
        return NextResponse.json(trending);

      case 'feeds':
        const feeds = threatIntelligence.getFeeds();
        return NextResponse.json({ feeds });

      default:
        // Get indicators with optional filtering
        const types = searchParams.get('types')?.split(',');
        const indicators = await threatIntelligence.fetchIndicators(types);
        return NextResponse.json({ indicators });
    }
  } catch (error) {
    console.error('Error in threat intelligence API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threat intelligence' },
      { status: 500 }
    );
  }
}

// POST /api/threat-intelligence - Search or configure threat intelligence
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, query, type, feedName, config, enabled } = body;

    switch (action) {
      case 'search':
        const searchResults = await threatIntelligence.searchIndicators(query, type);
        return NextResponse.json({ indicators: searchResults });

      case 'configure_feed':
        if (!feedName || !config) {
          return NextResponse.json(
            { error: 'feedName and config are required' },
            { status: 400 }
          );
        }
        threatIntelligence.configureFeed(feedName, config);
        return NextResponse.json({ message: 'Feed configured successfully' });

      case 'toggle_feed':
        if (!feedName || enabled === undefined) {
          return NextResponse.json(
            { error: 'feedName and enabled are required' },
            { status: 400 }
          );
        }
        threatIntelligence.setFeedEnabled(feedName, enabled);
        return NextResponse.json({ message: `Feed ${enabled ? 'enabled' : 'disabled'} successfully` });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported: search, configure_feed, toggle_feed' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in threat intelligence POST:', error);
    return NextResponse.json(
      { error: 'Threat intelligence operation failed' },
      { status: 500 }
    );
  }
}
