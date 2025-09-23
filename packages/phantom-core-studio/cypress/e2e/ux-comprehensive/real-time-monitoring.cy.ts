/// <reference types="cypress" />

/**
 * UX Test Suite: Real-time Monitoring & Live Updates
 * WebSocket connections, live data streams, and real-time UX patterns
 */

describe('UX: Real-time Monitoring & Live Updates', () => {
  beforeEach(() => {
    cy.setupTestEnvironment('ml-models');
  });

  describe('Live Model Performance Monitoring', () => {
    beforeEach(() => {
      cy.visit('/real-time-monitoring');
    });

    it('should display real-time model performance metrics effectively', () => {
      // Test initial monitoring dashboard
      cy.get('[data-cy="monitoring-dashboard"]').should('be.visible');
      cy.get('[data-cy="connection-status"]').should('contain', 'Connected');
      cy.get('[data-cy="realtime-indicator"]').should('have.class', 'pulse-animation');

      // Mock WebSocket connection
      cy.window().then((win) => {
        const mockSocket = {
          readyState: 1, // OPEN
          onmessage: null as ((event: MessageEvent) => void) | null,
          send: cy.stub(),
          close: cy.stub()
        };

        // Simulate real-time metric updates
        setTimeout(() => {
          if (mockSocket.onmessage) {
            mockSocket.onmessage({
              data: JSON.stringify({
                type: 'performance_update',
                modelId: 'model-123',
                metrics: {
                  accuracy: 0.924,
                  latency: 45,
                  throughput: 1250,
                  errorRate: 0.002
                },
                timestamp: new Date().toISOString()
              })
            } as MessageEvent);
          }
        }, 1000);

        (win as unknown as Window & { mockWebSocket: typeof mockSocket }).mockWebSocket = mockSocket;
      });

      // Verify live metric updates
      cy.get('[data-cy="live-accuracy"]', { timeout: 2000 }).should('contain', '92.4%');
      cy.get('[data-cy="live-latency"]').should('contain', '45ms');
      cy.get('[data-cy="live-throughput"]').should('contain', '1,250');
      cy.get('[data-cy="live-error-rate"]').should('contain', '0.2%');

      // Test metric trend indicators
      cy.get('[data-cy="accuracy-trend"]').should('have.class', 'trending-up');
      cy.get('[data-cy="latency-trend"]').should('be.visible');

      // Test alert thresholds
      cy.window().then((win) => {
        const mockWin = win as unknown as Window & {
          mockWebSocket: {
            onmessage: (event: MessageEvent) => void;
          };
        };
        mockWin.mockWebSocket.onmessage({
          data: JSON.stringify({
            type: 'performance_update',
            modelId: 'model-123',
            metrics: {
              accuracy: 0.750, // Below threshold
              errorRate: 0.15  // Above threshold
            },
            alerts: ['accuracy_degradation', 'high_error_rate']
          })
        } as MessageEvent);
      });

      cy.get('[data-cy="alert-accuracy-degradation"]').should('be.visible');
      cy.get('[data-cy="alert-high-error-rate"]').should('be.visible');
      cy.get('[data-cy="alert-sound"]').should('exist');
    });

    it('should visualize real-time performance trends', () => {
      // Test real-time chart updates
      cy.waitForChart('[data-cy="realtime-performance-chart"]');
      cy.get('[data-cy="chart-auto-scroll"]').should('be.checked');

      // Mock streaming data points
      cy.window().then((win) => {
        const mockWin = win as unknown as Window & {
          mockWebSocket: {
            onmessage: (event: MessageEvent) => void;
          };
        };
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            mockWin.mockWebSocket.onmessage({
              data: JSON.stringify({
                type: 'metric_point',
                timestamp: new Date(Date.now() + i * 1000).toISOString(),
                accuracy: 0.90 + Math.random() * 0.05,
                latency: 40 + Math.random() * 20
              })
            } as MessageEvent);
          }, i * 500);
        }
      });

      // Verify chart updates smoothly
      cy.get('[data-cy="chart-point-count"]', { timeout: 3000 }).should('match', /\d+ points?/);
      cy.get('[data-cy="chart-animation"]').should('have.class', 'smooth-transition');

      // Test time window controls
      cy.get('[data-cy="time-window-selector"]').should('be.visible');
      cy.muiSelectOption('time-window-selector', '5 minutes');

      // Chart should adjust to new time window
      cy.get('[data-cy="chart-time-range"]').should('contain', '5 min');

      // Test pause/resume functionality
      cy.get('[data-cy="pause-realtime"]').click();
      cy.get('[data-cy="realtime-paused-indicator"]').should('be.visible');

      cy.get('[data-cy="resume-realtime"]').click();
      cy.get('[data-cy="realtime-active-indicator"]').should('be.visible');
    });

    it('should handle connection interruptions gracefully', () => {
      // Test connection loss handling
      cy.window().then((win) => {
        const mockWin = win as unknown as Window & {
          mockWebSocket: {
            readyState: number;
          };
        };
        mockWin.mockWebSocket.readyState = 3; // CLOSED
        win.dispatchEvent(new CustomEvent('websocket-disconnected'));
      });

      // Should show disconnection state
      cy.get('[data-cy="connection-status"]').should('contain', 'Disconnected');
      cy.get('[data-cy="realtime-indicator"]').should('have.class', 'disconnected');
      cy.get('[data-cy="reconnect-notification"]').should('be.visible');

      // Test automatic reconnection
      cy.get('[data-cy="auto-reconnect-enabled"]').should('be.checked');
      cy.get('[data-cy="reconnect-attempt-count"]').should('be.visible');

      // Mock successful reconnection
      cy.window().then((win) => {
        const mockWin = win as unknown as Window & {
          mockWebSocket: {
            readyState: number;
          };
        };
        mockWin.mockWebSocket.readyState = 1; // OPEN
        win.dispatchEvent(new CustomEvent('websocket-connected'));
      });

      cy.get('[data-cy="connection-status"]').should('contain', 'Connected');
      cy.get('[data-cy="reconnect-success-toast"]').should('be.visible');

      // Test manual reconnection
      cy.window().then((win) => {
        const mockWin = win as unknown as Window & {
          mockWebSocket: {
            readyState: number;
          };
        };
        mockWin.mockWebSocket.readyState = 3; // CLOSED
        win.dispatchEvent(new CustomEvent('websocket-disconnected'));
      });

      cy.get('[data-cy="manual-reconnect"]').click();
      cy.get('[data-cy="connecting-spinner"]').should('be.visible');
    });
  });

  describe('Live Training Progress Monitoring', () => {
    beforeEach(() => {
      cy.visit('/modelBuilder');
      // Setup training scenario
      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');
      cy.muiStepperNavigate('next');
      cy.muiSelectOption('form-select-target-column', 'performance_score');
      cy.muiStepperNavigate('next');
      cy.get('[data-cy="algorithm-card-random-forest"]').click();
      cy.muiStepperNavigate('next');
    });

    it('should monitor training progress in real-time', () => {
      cy.muiClickButton('btn-start-training');

      // Test training progress dashboard
      cy.get('[data-cy="training-progress-container"]').should('be.visible');
      cy.get('[data-cy="live-training-metrics"]').should('be.visible');

      // Mock training progress updates
      cy.window().then((win) => {
        const mockWin = win as unknown as Window & {
          mockWebSocket: {
            onmessage: (event: MessageEvent) => void;
          };
        };
        const progressUpdates = [
          { epoch: 1, loss: 0.8, accuracy: 0.65, progress: 10 },
          { epoch: 5, loss: 0.6, accuracy: 0.78, progress: 25 },
          { epoch: 10, loss: 0.45, accuracy: 0.85, progress: 50 },
          { epoch: 15, loss: 0.35, accuracy: 0.89, progress: 75 },
          { epoch: 20, loss: 0.28, accuracy: 0.92, progress: 100 }
        ];

        progressUpdates.forEach((update, index) => {
          setTimeout(() => {
            mockWin.mockWebSocket.onmessage({
              data: JSON.stringify({
                type: 'training_progress',
                trainingId: 'training-123',
                ...update,
                timestamp: new Date().toISOString()
              })
            } as MessageEvent);
          }, index * 1000);
        });
      });

      // Test real-time progress updates
      cy.get('[data-cy="current-epoch"]', { timeout: 2000 }).should('contain', 'Epoch 1');
      cy.get('[data-cy="current-loss"]').should('contain', '0.8');
      cy.get('[data-cy="current-accuracy"]').should('contain', '65%');

      // Test progress visualization
      cy.waitForChart('[data-cy="training-loss-chart"]');
      cy.waitForChart('[data-cy="training-accuracy-chart"]');

      // Verify charts update with new data points
      cy.get('[data-cy="loss-chart-points"]', { timeout: 3000 }).should('have.length.greaterThan', 2);

      // Test training completion
      cy.get('[data-cy="training-complete"]', { timeout: 6000 }).should('be.visible');
      cy.get('[data-cy="completion-animation"]').should('be.visible');
      cy.get('[data-cy="final-metrics"]').should('be.visible');
    });

    it('should provide live resource utilization monitoring', () => {
      cy.muiClickButton('btn-start-training');

      // Test resource monitoring dashboard
      cy.get('[data-cy="resource-monitoring"]').should('be.visible');

      // Mock resource updates
      cy.window().then((win) => {
        const mockWin = win as unknown as Window & {
          mockWebSocket: {
            onmessage: (event: MessageEvent) => void;
          };
        };
        setInterval(() => {
          mockWin.mockWebSocket.onmessage({
            data: JSON.stringify({
              type: 'resource_update',
              resources: {
                cpu: Math.random() * 100,
                memory: 60 + Math.random() * 30,
                gpu: Math.random() * 100,
                disk: 20 + Math.random() * 10
              }
            })
          } as MessageEvent);
        }, 2000);
      });

      // Test real-time resource gauges
      cy.get('[data-cy="cpu-gauge"]').should('be.visible');
      cy.get('[data-cy="memory-gauge"]').should('be.visible');
      cy.get('[data-cy="gpu-gauge"]').should('be.visible');

      // Test resource alerts
      cy.window().then((win) => {
        const mockWin = win as unknown as Window & {
          mockWebSocket: {
            onmessage: (event: MessageEvent) => void;
          };
        };
        mockWin.mockWebSocket.onmessage({
          data: JSON.stringify({
            type: 'resource_update',
            resources: { memory: 95 }, // High memory usage
            alerts: ['high_memory_usage']
          })
        } as MessageEvent);
      });

      cy.get('[data-cy="alert-high-memory"]').should('be.visible');
      cy.get('[data-cy="resource-warning"]').should('contain', 'memory');

      // Test resource history charts
      cy.waitForChart('[data-cy="resource-history-chart"]');
      cy.get('[data-cy="resource-timeline"]').should('be.visible');
    });

    it('should enable real-time training intervention', () => {
      cy.muiClickButton('btn-start-training');

      // Test early stopping controls
      cy.get('[data-cy="early-stopping-controls"]').should('be.visible');
      cy.get('[data-cy="monitor-overfitting"]').should('be.checked');

      // Mock overfitting detection
      cy.window().then((win) => {
        const mockWin = win as unknown as Window & {
          mockWebSocket: {
            onmessage: (event: MessageEvent) => void;
          };
        };
        mockWin.mockWebSocket.onmessage({
          data: JSON.stringify({
            type: 'training_alert',
            alert: 'overfitting_detected',
            epoch: 8,
            validation_loss: 0.45,
            training_loss: 0.25
          })
        } as MessageEvent);
      });

      cy.get('[data-cy="overfitting-alert"]').should('be.visible');
      cy.get('[data-cy="suggest-early-stop"]').should('be.visible');

      // Test manual intervention
      cy.get('[data-cy="pause-training"]').click();
      cy.get('[data-cy="training-paused"]').should('be.visible');

      cy.get('[data-cy="adjust-learning-rate"]').click();
      cy.get('[data-cy="learning-rate-adjustment"]').should('be.visible');
      cy.muiInteractWithSlider('new-learning-rate', 0.001);
      cy.muiClickButton('apply-adjustment');

      cy.get('[data-cy="resume-training"]').click();
      cy.get('[data-cy="training-resumed"]').should('be.visible');

      // Test hyperparameter modification during training
      cy.get('[data-cy="modify-hyperparameters"]').click();
      cy.get('[data-cy="live-hyperparameter-editor"]').should('be.visible');

      cy.muiToggleSwitch('enable-dropout', true);
      cy.muiInteractWithSlider('dropout-rate', 0.3);
      cy.muiClickButton('apply-changes');

      cy.get('[data-cy="hyperparameter-applied"]').should('be.visible');
    });
  });

  describe('Real-time Collaboration Features', () => {
    beforeEach(() => {
      cy.visit('/experiments/collaborative-123');
    });

    it('should support real-time collaborative editing', () => {
      // Test collaborative experiment editing
      cy.get('[data-cy="collaborative-editor"]').should('be.visible');
      cy.get('[data-cy="online-users"]').should('be.visible');

      // Mock other user joining
      cy.window().then((win) => {
        const mockWin = win as unknown as Window & {
          mockWebSocket: {
            onmessage: (event: MessageEvent) => void;
          };
        };
        mockWin.mockWebSocket.onmessage({
          data: JSON.stringify({
            type: 'user_joined',
            user: {
              id: 'user-456',
              name: 'Jane Doe',
              avatar: '/avatars/jane.jpg',
              cursor: { x: 100, y: 200 }
            }
          })
        } as MessageEvent);
      });

      cy.get('[data-cy="user-jane-doe"]').should('be.visible');
      cy.get('[data-cy="user-cursor-jane"]').should('be.visible');

      // Test real-time cursor tracking
      cy.get('[data-cy="experiment-description"]').click();
      cy.window().then((win) => {
        const mockWin = win as unknown as Window & {
          mockWebSocket: {
            onmessage: (event: MessageEvent) => void;
          };
        };
        mockWin.mockWebSocket.onmessage({
          data: JSON.stringify({
            type: 'cursor_move',
            userId: 'user-456',
            position: { x: 300, y: 150 }
          })
        } as MessageEvent);
      });

      cy.get('[data-cy="user-cursor-jane"]').should('have.css', 'left', '300px');

      // Test collaborative text editing
      cy.muiTypeInTextField('experiment-description', 'Testing collaboration');

      // Mock other user's edit
      cy.window().then((win) => {
        const mockWin = win as unknown as Window & {
          mockWebSocket: {
            onmessage: (event: MessageEvent) => void;
          };
        };
        mockWin.mockWebSocket.onmessage({
          data: JSON.stringify({
            type: 'text_edit',
            userId: 'user-456',
            field: 'experiment-description',
            operation: {
              type: 'insert',
              position: 20,
              text: ' features'
            }
          })
        } as MessageEvent);
      });

      cy.get('[data-cy="experiment-description"]').should('have.value', 'Testing collaboration features');

      // Test conflict resolution
      cy.get('[data-cy="edit-conflict-indicator"]').should('be.visible');
      cy.get('[data-cy="resolve-conflict"]').click();
      cy.get('[data-cy="conflict-resolution-modal"]').should('be.visible');
    });

    it('should provide real-time activity feeds', () => {
      // Test activity stream
      cy.get('[data-cy="activity-feed"]').should('be.visible');

      // Mock activity updates
      cy.window().then((win) => {
        const mockWin = win as unknown as Window & {
          mockWebSocket: {
            onmessage: (event: MessageEvent) => void;
          };
        };
        const activities = [
          { user: 'John Smith', action: 'modified', target: 'hyperparameters', timestamp: new Date().toISOString() },
          { user: 'Jane Doe', action: 'added', target: 'comment', timestamp: new Date().toISOString() },
          { user: 'Bob Wilson', action: 'started', target: 'training', timestamp: new Date().toISOString() }
        ];

        activities.forEach((activity, index) => {
          setTimeout(() => {
            mockWin.mockWebSocket.onmessage({
              data: JSON.stringify({
                type: 'activity_update',
                activity
              })
            } as MessageEvent);
          }, index * 500);
        });
      });

      // Verify activity feed updates
      cy.get('[data-cy="activity-item"]', { timeout: 2000 }).should('have.length.greaterThan', 0);
      cy.get('[data-cy="activity-user-john"]').should('contain', 'John Smith');
      cy.get('[data-cy="activity-action"]').should('contain', 'modified');

      // Test activity filtering
      cy.get('[data-cy="filter-activities"]').click();
      cy.get('[data-cy="filter-by-user"]').select('Jane Doe');
      cy.get('[data-cy="activity-item"]').should('have.length', 1);

      // Test activity timestamps
      cy.get('[data-cy="activity-timestamp"]').should('contain', 'seconds ago');
    });

    it('should enable real-time comments and discussions', () => {
      // Test comment system
      cy.get('[data-cy="comments-section"]').should('be.visible');
      cy.get('[data-cy="add-comment"]').click();

      cy.muiTypeInTextField('comment-text', 'Great experiment setup!');
      cy.muiClickButton('post-comment');

      // Mock comment from another user
      cy.window().then((win) => {
        const mockWin = win as unknown as Window & {
          mockWebSocket: {
            onmessage: (event: MessageEvent) => void;
          };
        };
        mockWin.mockWebSocket.onmessage({
          data: JSON.stringify({
            type: 'new_comment',
            comment: {
              id: 'comment-456',
              user: 'Jane Doe',
              text: 'Thanks! The results look promising.',
              timestamp: new Date().toISOString(),
              reactions: []
            }
          })
        } as MessageEvent);
      });

      // Verify real-time comment appears
      cy.get('[data-cy="comment-456"]').should('be.visible');
      cy.get('[data-cy="comment-user-jane"]').should('contain', 'Jane Doe');
      cy.get('[data-cy="comment-text"]').should('contain', 'promising');

      // Test real-time reactions
      cy.get('[data-cy="comment-456"] [data-cy="add-reaction"]').click();
      cy.get('[data-cy="reaction-thumbs-up"]').click();

      // Mock reaction from another user
      cy.window().then((win) => {
        const mockWin = win as unknown as Window & {
          mockWebSocket: {
            onmessage: (event: MessageEvent) => void;
          };
        };
        mockWin.mockWebSocket.onmessage({
          data: JSON.stringify({
            type: 'comment_reaction',
            commentId: 'comment-456',
            reaction: { emoji: '👍', userId: 'user-789', userName: 'Bob Wilson' }
          })
        } as MessageEvent);
      });

      cy.get('[data-cy="reaction-count-thumbs-up"]').should('contain', '2');

      // Test mention notifications
      cy.muiTypeInTextField('comment-text', '@jane Great point about the validation set');
      cy.get('[data-cy="mention-suggestion-jane"]').click();
      cy.muiClickButton('post-comment');

      // Should trigger notification for mentioned user
      cy.get('[data-cy="mention-notification"]').should('be.visible');
    });
  });

  describe('Live Data Streaming Performance', () => {
    it('should handle high-frequency data streams efficiently', () => {
      cy.visit('/real-time-monitoring');

      // Test high-frequency updates
      cy.window().then((win) => {
        const mockWin = win as unknown as Window & {
          mockWebSocket: {
            onmessage: (event: MessageEvent) => void;
          };
        };
        // Simulate 10 updates per second
        setInterval(() => {
          mockWin.mockWebSocket.onmessage({
            data: JSON.stringify({
              type: 'high_frequency_update',
              metrics: {
                timestamp: Date.now(),
                value: Math.random() * 100
              }
            })
          } as MessageEvent);
        }, 100);
      });

      // Should throttle updates for performance
      cy.get('[data-cy="update-throttle-indicator"]').should('be.visible');
      cy.get('[data-cy="updates-per-second"]').should('match', /[1-5] updates\/sec/);

      // Test data buffering
      cy.get('[data-cy="buffer-size"]').should('be.visible');
      cy.get('[data-cy="buffer-indicator"]').should('have.class', 'optimal');

      // Test memory management with streaming data
      cy.wait(5000);
      cy.window().then((win) => {
        const mockWin = win as Window & {
          performance: Performance & {
            memory?: {
              usedJSHeapSize: number;
            };
          };
        };
        if (mockWin.performance.memory) {
          expect(mockWin.performance.memory.usedJSHeapSize).to.be.lessThan(100000000); // < 100MB
        }
      });
    });

    it('should provide adaptive quality based on connection', () => {
      // Test quality adaptation
      cy.get('[data-cy="stream-quality"]').should('contain', 'High');

      // Simulate slow connection
      cy.window().then(win => {
        win.dispatchEvent(new CustomEvent('connection-slow'));
      });

      cy.get('[data-cy="stream-quality"]').should('contain', 'Medium');
      cy.get('[data-cy="quality-adjustment-notice"]').should('be.visible');

      // Test reduced update frequency
      cy.get('[data-cy="update-frequency"]').should('contain', 'reduced');

      // Test quality restoration
      cy.window().then(win => {
        win.dispatchEvent(new CustomEvent('connection-fast'));
      });

      cy.get('[data-cy="stream-quality"]').should('contain', 'High');
      cy.get('[data-cy="quality-restored-notice"]').should('be.visible');
    });

    it('should maintain real-time accuracy with large datasets', () => {
      cy.visit('/real-time-monitoring/large-scale');

      // Test large-scale monitoring
      cy.get('[data-cy="monitoring-scale"]').should('contain', '1000+ models');
      cy.get('[data-cy="data-points-per-second"]').should('match', /\d+k/);

      // Test data aggregation for performance
      cy.get('[data-cy="aggregation-level"]').should('be.visible');
      cy.get('[data-cy="aggregated-metrics"]').should('be.visible');

      // Test sampling strategies
      cy.get('[data-cy="sampling-rate"]').should('be.visible');
      cy.get('[data-cy="sample-representation"]').should('contain', '99%');

      // Test real-time alerts at scale
      cy.window().then((win) => {
        const mockWin = win as unknown as Window & {
          mockWebSocket: {
            onmessage: (event: MessageEvent) => void;
          };
        };
        mockWin.mockWebSocket.onmessage({
          data: JSON.stringify({
            type: 'bulk_alert',
            alerts: Array.from({ length: 50 }, (_, i) => ({
              modelId: `model-${i}`,
              type: 'performance_degradation',
              severity: 'medium'
            }))
          })
        } as MessageEvent);
      });

      cy.get('[data-cy="alert-summary"]').should('contain', '50 alerts');
      cy.get('[data-cy="alert-aggregation"]').should('be.visible');
    });
  });
});
