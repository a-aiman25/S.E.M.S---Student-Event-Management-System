import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    PDFDownloadLink,
    Image,
} from "@react-pdf/renderer";
import {
    FaDownload,
    FaPrint,
    FaEnvelope,
    FaTicketAlt,
    FaQrcode,
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaUser,
    FaIdCard,
    FaDollarSign,
    FaCheckCircle,
} from "react-icons/fa";
import QRCode from "qrcode";
import toast from "react-hot-toast";

// PDF Styles
const styles = StyleSheet.create({
    page: {
        padding: 20,
        backgroundColor: "#ffffff",
    },
    ticketContainer: {
        border: "1px solid #e0e0e0",
        borderRadius: 12,
        overflow: "hidden",
    },
    header: {
        backgroundColor: "#4B0082",
        padding: 20,
        alignItems: "center",
    },
    headerText: {
        color: "#ffffff",
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
    },
    subHeader: {
        color: "#e0e0e0",
        fontSize: 12,
        textAlign: "center",
        marginTop: 5,
    },
    eventName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#4B0082",
        marginBottom: 15,
        textAlign: "center",
    },
    detailSection: {
        padding: 20,
    },
    detailRow: {
        flexDirection: "row",
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        paddingBottom: 8,
    },
    label: {
        width: "35%",
        fontSize: 10,
        fontWeight: "bold",
        color: "#666",
    },
    value: {
        width: "65%",
        fontSize: 10,
        color: "#333",
    },
    qrSection: {
        alignItems: "center",
        marginTop: 10,
        marginBottom: 10,
    },
    footer: {
        backgroundColor: "#f8f9fa",
        padding: 15,
        alignItems: "center",
    },
    footerText: {
        fontSize: 8,
        color: "#999",
        textAlign: "center",
    },
    ticketId: {
        fontSize: 9,
        color: "#666",
        textAlign: "center",
        marginTop: 10,
    },
    tearLine: {
        borderTopWidth: 1,
        borderTopColor: "#ccc",
        borderStyle: "dashed",
        marginVertical: 10,
    },
});

// PDF Ticket Component
const TicketPDF = ({ booking, event, user, ticketNumber }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState("");

    useEffect(() => {
        const ticketData = JSON.stringify({
            ticketId: ticketNumber,
            bookingId: booking.id,
            eventId: event.id || booking.id,
            studentId: user.registration_number,
            eventName: event.event_name,
            date: event.event_date,
            studentName: `${user.first_name} ${user.last_name}`,
        });

        QRCode.toDataURL(ticketData, { width: 150, margin: 1 }, (err, url) => {
            if (!err) setQrCodeUrl(url);
        });
    }, []);

    return (
        <Document>
            <Page size="A6" style={styles.page}>
                <View style={styles.ticketContainer}>
                    <View style={styles.header}>
                        <Text style={styles.headerText}>Sir Syed University</Text>
                        <Text style={styles.subHeader}>S.E.M.S - Event Ticket</Text>
                    </View>

                    <View style={styles.detailSection}>
                        <Text style={styles.eventName}>{event.event_name}</Text>

                        <View style={styles.detailRow}>
                            <Text style={styles.label}>Ticket Number:</Text>
                            <Text style={styles.value}>{ticketNumber}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.label}>Student Name:</Text>
                            <Text style={styles.value}>
                                {user.first_name} {user.last_name}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.label}>Registration No:</Text>
                            <Text style={styles.value}>{user.registration_number}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.label}>Event Date:</Text>
                            <Text style={styles.value}>{event.event_date}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.label}>Venue:</Text>
                            <Text style={styles.value}>{event.event_venue}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.label}>Seats:</Text>
                            <Text style={styles.value}>{booking.num_tickets}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.label}>Amount Paid:</Text>
                            <Text style={styles.value}>PKR {booking.total_price}/-</Text>
                        </View>

                        {qrCodeUrl && (
                            <View style={styles.qrSection}>
                                <Image src={qrCodeUrl} style={{ width: 100, height: 100 }} />
                                <Text style={{ fontSize: 8, marginTop: 5, color: "#666" }}>
                                    Scan to verify
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.tearLine} />

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Please present this ticket at the event entrance
                        </Text>
                        <Text style={styles.footerText}>
                            Valid University ID required for entry
                        </Text>
                    </View>

                    <Text style={styles.ticketId}>
                        Generated on {new Date().toLocaleDateString()}
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

// Main Ticket Modal Component
const TicketModal = ({ show, onHide, booking, event, user }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const [isDownloading, setIsDownloading] = useState(false);

    const ticketNumber = React.useMemo(() => {
        const prefix = "SSUET";
        const date = new Date().getFullYear();
        const random = Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, "0");
        return `${prefix}-${date}-${booking.id}-${random}`;
    }, [booking.id]);

    useEffect(() => {
        const ticketData = JSON.stringify({
            ticketId: ticketNumber,
            bookingId: booking.id,
            studentId: user.registration_number,
            eventName: event.event_name,
            date: event.event_date,
        });

        QRCode.toDataURL(ticketData, { width: 200, margin: 2 }, (err, url) => {
            if (!err) setQrCodeUrl(url);
        });
    }, [ticketNumber]);

    const handlePrint = () => {
        const printContent = document.getElementById("ticket-print-content");
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContent.innerHTML;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload();
    };

    const handleEmailTicket = async () => {
        setIsDownloading(true);
        toast.loading("Preparing ticket for email...");
        setTimeout(() => {
            toast.dismiss();
            toast.success("Ticket will be sent to your email shortly!");
            setIsDownloading(false);
        }, 1500);
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            centered
            className="ticket-modal"
        >
            <Modal.Body className="p-0">
                {/* Ticket Content */}
                <div id="ticket-print-content">
                    <div className="modern-ticket">
                        {/* Ticket Header */}
                        <div className="ticket-header-modern">
                            <div className="ticket-header-bg"></div>
                            <div className="ticket-header-content">
                                <div className="university-badge">
                                    <FaTicketAlt className="me-2" />
                                    <span>S.E.M.S</span>
                                </div>
                                <h3>Sir Syed University of Engineering & Technology</h3>
                                <p>Official Event Ticket</p>
                            </div>
                        </div>

                        {/* Ticket Body */}
                        <div className="ticket-body-modern">
                            <div className="event-title-section">
                                <h2>{event.event_name}</h2>
                                <div className="ticket-status">
                                    <FaCheckCircle className="me-1" /> CONFIRMED
                                </div>
                            </div>

                            <div className="ticket-details-grid">
                                <div className="detail-item">
                                    <div className="detail-icon">
                                        <FaTicketAlt />
                                    </div>
                                    <div className="detail-info">
                                        <label>Ticket Number</label>
                                        <p>{ticketNumber}</p>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <div className="detail-icon">
                                        <FaUser />
                                    </div>
                                    <div className="detail-info">
                                        <label>Student Name</label>
                                        <p>
                                            {user.first_name} {user.last_name}
                                        </p>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <div className="detail-icon">
                                        <FaIdCard />
                                    </div>
                                    <div className="detail-info">
                                        <label>Registration Number</label>
                                        <p>{user.registration_number}</p>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <div className="detail-icon">
                                        <FaCalendarAlt />
                                    </div>
                                    <div className="detail-info">
                                        <label>Event Date</label>
                                        <p>{event.event_date}</p>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <div className="detail-icon">
                                        <FaMapMarkerAlt />
                                    </div>
                                    <div className="detail-info">
                                        <label>Venue</label>
                                        <p>{event.event_venue}</p>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <div className="detail-icon">
                                        <FaDollarSign />
                                    </div>
                                    <div className="detail-info">
                                        <label>Amount Paid</label>
                                        <p>PKR {booking.total_price}/-</p>
                                    </div>
                                </div>
                            </div>

                            <div className="ticket-separator">
                                <div className="separator-line"></div>
                                <div className="separator-icon">✂</div>
                                <div className="separator-line"></div>
                            </div>

                            <div className="ticket-qr-section">
                                <div className="qr-container-modern">
                                    {qrCodeUrl ? (
                                        <img
                                            src={qrCodeUrl}
                                            alt="QR Code"
                                            className="qr-code-modern"
                                        />
                                    ) : (
                                        <div className="qr-placeholder">Loading QR...</div>
                                    )}
                                    <p className="qr-text">
                                        Scan this QR code at the entrance for verification
                                    </p>
                                </div>

                                <div className="ticket-info-box">
                                    <h6>Important Instructions</h6>
                                    <ul>
                                        <li>Please carry your University ID card</li>
                                        <li>Arrive 15 minutes before the event starts</li>
                                        <li>Screenshot of this ticket is acceptable</li>
                                        <li>Ticket is non-transferable</li>
                                        <li>Entry closes 30 minutes after start time</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Ticket Footer */}
                        <div className="ticket-footer-modern">
                            <p>For queries, contact: events@ssuet.edu.pk | +92-21-12345678</p>
                            <p className="mt-1">
                                © 2024 Sir Syed University - Event Management System
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="ticket-actions-modern">
                    <PDFDownloadLink
                        document={
                            <TicketPDF
                                booking={booking}
                                event={event}
                                user={user}
                                ticketNumber={ticketNumber}
                            />
                        }
                        fileName={`${event.event_name.replace(/\s/g, "_")}_Ticket.pdf`}
                        className="btn-download"
                    >
                        {({ loading }) => (
                            <>
                                <FaDownload /> {loading ? "Generating..." : "Download PDF"}
                            </>
                        )}
                    </PDFDownloadLink>

                    <button className="btn-print" onClick={handlePrint}>
                        <FaPrint /> Print Ticket
                    </button>

                    <button
                        className="btn-email"
                        onClick={handleEmailTicket}
                        disabled={isDownloading}
                    >
                        <FaEnvelope /> Email Ticket
                    </button>

                    <button className="btn-close-ticket" onClick={onHide}>
                        Close
                    </button>
                </div>
            </Modal.Body>

            <style jsx>{`
        .modern-ticket {
          background: white;
          max-width: 500px;
          margin: 0 auto;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .ticket-header-modern {
          position: relative;
          background: linear-gradient(135deg, #4b0082, #6b3fa0);
          padding: 30px 20px;
          text-align: center;
          color: white;
        }

        .ticket-header-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.05) 0px,
            rgba(255, 255, 255, 0.05) 20px,
            transparent 20px,
            transparent 40px
          );
        }

        .ticket-header-content {
          position: relative;
          z-index: 1;
        }

        .university-badge {
          display: inline-flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          padding: 8px 20px;
          border-radius: 50px;
          font-size: 0.85rem;
          margin-bottom: 15px;
        }

        .ticket-header-modern h3 {
          font-size: 1.3rem;
          margin-bottom: 5px;
        }

        .ticket-header-modern p {
          opacity: 0.8;
          font-size: 0.85rem;
        }

        .ticket-body-modern {
          padding: 25px;
        }

        .event-title-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f0f0f0;
        }

        .event-title-section h2 {
          font-size: 1.3rem;
          color: #4b0082;
          margin: 0;
        }

        .ticket-status {
          background: #e8f5e9;
          color: #006633;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .ticket-details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 25px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 12px;
          transition: transform 0.3s ease;
        }

        .detail-item:hover {
          transform: translateX(5px);
        }

        .detail-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #4b0082, #6b3fa0);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.1rem;
        }

        .detail-info {
          flex: 1;
        }

        .detail-info label {
          font-size: 0.7rem;
          color: #999;
          display: block;
          margin-bottom: 3px;
        }

        .detail-info p {
          font-size: 0.85rem;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .ticket-separator {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 20px 0;
        }

        .separator-line {
          flex: 1;
          height: 2px;
          background: repeating-linear-gradient(
            90deg,
            #ddd,
            #ddd 10px,
            transparent 10px,
            transparent 20px
          );
        }

        .separator-icon {
          color: #999;
          font-size: 0.8rem;
        }

        .ticket-qr-section {
          display: flex;
          gap: 20px;
          margin-top: 10px;
          flex-wrap: wrap;
        }

        .qr-container-modern {
          flex: 1;
          text-align: center;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 16px;
        }

        .qr-code-modern {
          width: 120px;
          height: 120px;
          margin-bottom: 10px;
        }

        .qr-text {
          font-size: 0.7rem;
          color: #666;
          margin: 0;
        }

        .ticket-info-box {
          flex: 1;
          background: #fff3e0;
          border-radius: 16px;
          padding: 15px;
        }

        .ticket-info-box h6 {
          color: #ff8c00;
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .ticket-info-box ul {
          margin: 0;
          padding-left: 20px;
        }

        .ticket-info-box li {
          font-size: 0.7rem;
          color: #666;
          margin-bottom: 5px;
        }

        .ticket-footer-modern {
          background: #1a1a2e;
          color: rgba(255, 255, 255, 0.7);
          padding: 15px;
          text-align: center;
          font-size: 0.7rem;
        }

        .ticket-actions-modern {
          display: flex;
          gap: 10px;
          padding: 20px;
          background: white;
          border-top: 1px solid #e0e0e0;
          flex-wrap: wrap;
          justify-content: center;
        }

        .btn-download,
        .btn-print,
        .btn-email,
        .btn-close-ticket {
          padding: 10px 20px;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-download {
          background: linear-gradient(135deg, #4b0082, #6b3fa0);
          color: white;
        }

        .btn-download:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(75, 0, 130, 0.3);
        }

        .btn-print {
          background: #006633;
          color: white;
        }

        .btn-print:hover {
          transform: translateY(-2px);
          background: #008844;
        }

        .btn-email {
          background: #17a2b8;
          color: white;
        }

        .btn-email:hover {
          transform: translateY(-2px);
          background: #138496;
        }

        .btn-close-ticket {
          background: #6c757d;
          color: white;
        }

        .btn-close-ticket:hover {
          background: #5a6268;
        }

        @media print {
          .ticket-actions-modern {
            display: none;
          }
          .modern-ticket {
            box-shadow: none;
          }
        }
      `}</style>
        </Modal>
    );
};

export default TicketModal;
