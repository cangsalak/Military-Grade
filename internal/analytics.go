package internal

import (
	"time"

	"github.com/max_kai/military-grade-wg/internal/models"
)

type AnalyticsEngine struct {
	wg *WGManager
	db *DBManager
}

func NewAnalyticsEngine(wg *WGManager, db *DBManager) *AnalyticsEngine {
	return &AnalyticsEngine{wg: wg, db: db}
}

func (e *AnalyticsEngine) StartCollector(interval time.Duration) {
	ticker := time.NewTicker(interval)
	go func() {
		for range ticker.C {
			e.collect()
		}
	}()
}

func (e *AnalyticsEngine) collect() {
	livePeers, err := e.wg.GetDevicePeers("wg0")
	if err != nil {
		return
	}

	var dbPeers []models.Peer
	e.db.DB.Find(&dbPeers)

	peerMap := make(map[string]uint)
	for _, p := range dbPeers {
		peerMap[p.PublicKey] = p.ID
	}

	now := time.Now()
	for _, lp := range livePeers {
		if peerID, ok := peerMap[lp.PublicKey.String()]; ok {
			metric := models.PeerMetric{
				PeerID:    peerID,
				Timestamp: now,
				RxBytes:   lp.ReceiveBytes,
				TxBytes:   lp.TransmitBytes,
			}
			e.db.DB.Create(&metric)
		}
	}
}
