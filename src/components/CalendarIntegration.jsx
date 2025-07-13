import React, { useState, useEffect } from 'react';
import { calendarAPI } from '../api';
import { Calendar, RefreshCw, Plus, Clock, MapPin, Users, ExternalLink } from 'lucide-react';
import './CalendarIntegration.css';

const CalendarIntegration = ({ user }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const eventsData = await calendarAPI.getEvents();
      setEvents(eventsData);
      setIsConnected(true);
    } catch (err) {
      if (err.message.includes('Google Calendar not connected')) {
        setIsConnected(false);
      } else {
        setError(err.message);
      }
    }
  };

  const handleConnectGoogle = async () => {
    try {
      setLoading(true);
      const { authUrl } = await calendarAPI.getAuthUrl();
      window.open(authUrl, '_blank', 'width=600,height=600');
      
      // Listen for auth completion
      const handleAuthComplete = (event) => {
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          setIsConnected(true);
          loadEvents();
          window.removeEventListener('message', handleAuthComplete);
        }
      };
      
      window.addEventListener('message', handleAuthComplete);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncCalendar = async () => {
    try {
      setSyncing(true);
      const result = await calendarAPI.sync();
      setError('');
      loadEvents();
      console.log(`Synced ${result.eventsCount} events`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const loadEvents = async (timeMin, timeMax) => {
    try {
      setLoading(true);
      const eventsData = await calendarAPI.getEvents(timeMin, timeMax);
      setEvents(eventsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Time';
      }
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Invalid Time';
    }
  };

  const getEventsByDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      try {
        const eventDate = new Date(event.start.dateTime || event.start.date);
        if (isNaN(eventDate.getTime())) {
          return false;
        }
        return eventDate.toISOString().split('T')[0] === dateStr;
      } catch (error) {
        console.warn('Invalid date in event:', event);
        return false;
      }
    });
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return events
      .filter(event => {
        try {
          const eventDate = new Date(event.start.dateTime || event.start.date);
          if (isNaN(eventDate.getTime())) {
            return false;
          }
          return eventDate >= now;
        } catch (error) {
          console.warn('Invalid date in event:', event);
          return false;
        }
      })
      .slice(0, 5);
  };

  if (!isConnected) {
    return (
      <div className="calendar-integration">
        <div className="calendar-header">
          <h2>Calendar Integration</h2>
        </div>
        
        <div className="calendar-connect">
          <div className="connect-card">
            <Calendar size={48} className="connect-icon" />
            <h3>Connect Google Calendar</h3>
            <p>
              Sync your Google Calendar events with your productivity tracker to get a complete 
              overview of your schedule and tasks.
            </p>
            <button 
              className="connect-btn"
              onClick={handleConnectGoogle}
              disabled={loading}
            >
              {loading ? 'Connecting...' : 'Connect Google Calendar'}
            </button>
            {error && <div className="error-message">{error}</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-integration">
      <div className="calendar-header">
        <h2>Calendar Integration</h2>
        <div className="calendar-actions">
          <button 
            className="sync-btn"
            onClick={handleSyncCalendar}
            disabled={syncing}
          >
            <RefreshCw size={16} className={syncing ? 'spinning' : ''} />
            {syncing ? 'Syncing...' : 'Sync Calendar'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="calendar-content">
        <div className="calendar-sidebar">
          <div className="upcoming-events">
            <h3>Upcoming Events</h3>
            {getUpcomingEvents().length === 0 ? (
              <p className="no-events">No upcoming events</p>
            ) : (
              <div className="events-list">
                {getUpcomingEvents().map((event, index) => (
                  <div key={event.id || index} className="event-item">
                    <div className="event-time">
                      {event.start.dateTime ? (
                        <span>{formatTime(event.start.dateTime)}</span>
                      ) : (
                        <span className="all-day">All Day</span>
                      )}
                    </div>
                    <div className="event-details">
                      <h4>{event.summary}</h4>
                      <p className="event-date">{formatDate(event.start.dateTime || event.start.date)}</p>
                      {event.location && (
                        <p className="event-location">
                          <MapPin size={14} />
                          {event.location}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="calendar-stats">
            <h3>Calendar Stats</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{events.length}</div>
                <div className="stat-label">Total Events</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{getUpcomingEvents().length}</div>
                <div className="stat-label">Upcoming</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {events.filter(e => e.attendees?.length > 1).length}
                </div>
                <div className="stat-label">Meetings</div>
              </div>
            </div>
          </div>
        </div>

        <div className="calendar-main">
          <div className="calendar-view">
            <h3>Today's Schedule</h3>
            <div className="todays-events">
              {getEventsByDate(new Date()).length === 0 ? (
                <div className="no-events-today">
                  <Calendar size={48} />
                  <p>No events scheduled for today</p>
                </div>
              ) : (
                <div className="events-timeline">
                  {getEventsByDate(new Date()).map((event, index) => (
                    <div key={event.id || index} className="timeline-event">
                      <div className="timeline-time">
                        {event.start.dateTime ? (
                          <>
                            <span className="start-time">{formatTime(event.start.dateTime)}</span>
                            <span className="end-time">{formatTime(event.end.dateTime)}</span>
                          </>
                        ) : (
                          <span className="all-day-badge">All Day</span>
                        )}
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-marker"></div>
                        <div className="event-card">
                          <h4>{event.summary}</h4>
                          {event.description && (
                            <p className="event-description">{event.description}</p>
                          )}
                          <div className="event-meta">
                            {event.location && (
                              <span className="event-location">
                                <MapPin size={14} />
                                {event.location}
                              </span>
                            )}
                            {event.attendees && event.attendees.length > 1 && (
                              <span className="event-attendees">
                                <Users size={14} />
                                {event.attendees.length} attendees
                              </span>
                            )}
                            {event.htmlLink && (
                              <a 
                                href={event.htmlLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="event-link"
                              >
                                <ExternalLink size={14} />
                                Open in Google Calendar
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="calendar-insights">
            <h3>Calendar Insights</h3>
            <div className="insights-grid">
              <div className="insight-card">
                <h4>Busiest Day</h4>
                <p className="insight-value">
                  {Object.entries(events.reduce((acc, event) => {
                    try {
                      const date = new Date(event.start.dateTime || event.start.date);
                      if (isNaN(date.getTime())) {
                        return acc;
                      }
                      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                      acc[dayName] = (acc[dayName] || 0) + 1;
                      return acc;
                    } catch (error) {
                      return acc;
                    }
                  }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] || 'No data'}
                </p>
              </div>
              
              <div className="insight-card">
                <h4>Average Meeting Duration</h4>
                <p className="insight-value">
                  {events.filter(e => e.start.dateTime && e.end.dateTime).length > 0 ? 
                    Math.round(
                      events
                        .filter(e => e.start.dateTime && e.end.dateTime)
                        .reduce((acc, event) => {
                          try {
                            const startDate = new Date(event.start.dateTime);
                            const endDate = new Date(event.end.dateTime);
                            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                              return acc;
                            }
                            const duration = endDate - startDate;
                            return acc + duration / (1000 * 60); // Convert to minutes
                          } catch (error) {
                            return acc;
                          }
                        }, 0) / events.filter(e => e.start.dateTime && e.end.dateTime).length
                    ) + ' minutes' : 'No data'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarIntegration;