import React, { useState } from "react";
import "./HelpCentre.css";
import {
  MdOutlineSchool,
  MdOutlineLayers,
  MdOutlineInsights,
  MdOutlineInventory2,
  MdOutlineAnalytics,
  MdOutlineLock,
  MdOutlineShoppingCart,
  MdOutlineSettings,
  MdOutlineSupportAgent,
  MdHelpOutline,
  MdOutlineCheckCircle,
  MdEmail,
  MdPhone,
  MdAccessTime
} from "react-icons/md";

const HelpCentre = () => {
  const [activeTab, setActiveTab] = useState("topics");
  const [faqOpen, setFaqOpen] = useState({});

  const toggleFaq = (index) => {
    setFaqOpen({ ...faqOpen, [index]: !faqOpen[index] });
  };

  const faqData = [
    {
      category: "Getting Started",
      faqs: [
        { q: "How do I log in to AgriPredict?", a: "Use your registered email and password. The system will redirect you to your role-specific dashboard (Owner, Manager, or Buyer)." },
        { q: "Can I access AgriPredict from mobile devices?", a: "Yes, AgriPredict is web-based and accessible on both desktops and mobile browsers." }
      ]
    },
    {
      category: "Batch Management",
      faqs: [
        { q: "How do I create a new batch?", a: "Navigate to the Batch Management section and click 'Add New Batch'. Fill in details like batch name, number of birds, and start date." },
        { q: "How can I update daily operations for a batch?", a: "Select the batch from your daily operations, then update feeding, egg production, and health check information for the day." },
        { q: "Can I view historical data for batches?", a: "Yes, all batch history is available in the Batch Management dashboard." }
      ]
    },
    {
      category: "AI Predictions",
      faqs: [
        { q: "What predictions are provided by AgriPredict?", a: "AgriPredict provides AI-powered predictions for egg production and mortality to help optimize farm management." },
        { q: "How accurate are the AI predictions?", a: "Predictions are based on historical batch data and farm operations. Accuracy improves as more data is recorded." },
        { q: "Can I simulate different scenarios for my batches?", a: "Yes, use the Scenario Simulation feature to test different feeding strategies or batch sizes." }
      ]
    },
    {
      category: "Inventory & Feed Management",
      faqs: [
        { q: "How do I track feed stock?", a: "Go to the Inventory section to view current stock and update quantities as needed." },
        { q: "Will the system alert me if feed is low?", a: "Yes, AgriPredict provides notifications when inventory falls below the recommended levels." }
      ]
    },
    {
      category: "Reports & Analytics",
      faqs: [
        { q: "How can I generate reports?", a: "Reports can be generated from the Reports dashboard for batches, egg production, feed efficiency, and more." },
        { q: "Can I export reports?", a: "Yes, reports can be exported as Excel files for documentation and planning." }
      ]
    },
    {
      category: "Blockchain Records",
      faqs: [
        { q: "What is the purpose of blockchain in AgriPredict?", a: "Blockchain ensures data integrity and transparency by securely storing batch operation records." },
        { q: "Can I verify batch history using blockchain?", a: "Yes, all batch records are blockchain-secured and can be viewed and verified from the dashboard." }
      ]
    },
    {
      category: "Orders & Requests (Buyers)",
      faqs: [
        { q: "How do I place an order for eggs or feed?", a: "Go to the Orders section, select the product, enter quantity, and submit your request." },
        { q: "How can I track my order status?", a: "Order history and current status are available in your dashboard under Order History." }
      ]
    },
    {
      category: "Settings & Profile",
      faqs: [
        { q: "How can I update my profile information?", a: "Navigate to Settings, where you can edit your name, email, password, and notification preferences." },
        { q: "Can I manage notifications?", a: "Yes, you can enable or disable email and in-app notifications from the Settings page." }
      ]
    },
    {
      category: "Troubleshooting & Support",
      faqs: [
        { q: "What should I do if I face technical issues?", a: "First, check the FAQs and Help Topics. If the problem persists, contact AgriPredict support via the Contact Support section." },
        { q: "How can I report a bug or request a feature?", a: "Use the Contact Support form with a detailed description of your issue or request." }
      ]
    }
  ];

  return (
    <div className="help-wrapper">
      <div className="help-tabs">
        <button
          className={`help-tab ${activeTab === "topics" ? "active" : ""}`}
          onClick={() => setActiveTab("topics")}
        >
          Help Topics
        </button>
        <button
          className={`help-tab ${activeTab === "faqs" ? "active" : ""}`}
          onClick={() => setActiveTab("faqs")}
        >
          FAQs
        </button>
        <button
          className={`help-tab ${activeTab === "contact" ? "active" : ""}`}
          onClick={() => setActiveTab("contact")}
        >
          Contact Support
        </button>
      </div>

      <div className="help-header">
        <h1>
          {activeTab === "topics"
            ? "Help Topics"
            : activeTab === "faqs"
            ? "Frequently Asked Questions"
            : "Contact Support"}
        </h1>
      </div>

      <div className="help-content">
        {activeTab === "topics" && (
          <div className="help-section topics-grid">
            <div className="help-card">
              <div className="icon-circle"><MdOutlineSchool color="#2E7D32" /></div>
              <div>
                <strong>Getting Started</strong> – Overview of AgriPredict and its purpose. How to log in and navigate the dashboard. Understanding your role: Owner, Manager, or Buyer.
              </div>
            </div>
            <div className="help-card">
              <div className="icon-circle"><MdOutlineLayers color="#2E7D32" /></div>
              <div>
                <strong>Batch Management</strong> – How to create and manage layer batches. Recording daily operations such as feeding, egg production, and health checks. Viewing batch performance and history.
              </div>
            </div>
            <div className="help-card">
              <div className="icon-circle"><MdOutlineInsights color="#2E7D32" /></div>
              <div>
                <strong>AI Predictions</strong> – Understanding egg production and feed efficiency predictions. How AI helps in planning and decision-making. Using scenario simulations to optimize farm outcomes.
              </div>
            </div>
            <div className="help-card">
              <div className="icon-circle"><MdOutlineInventory2 color="#2E7D32" /></div>
              <div>
                <strong>Inventory & Feed Management</strong> – Tracking feed stock and supplies. Updating inventory for batches. Alerts and recommendations for feed usage.
              </div>
            </div>
            <div className="help-card">
              <div className="icon-circle"><MdOutlineAnalytics color="#2E7D32" /></div>
              <div>
                <strong>Reports & Analytics</strong> – Generating reports for batch performance, egg production, and feed efficiency. Exporting data for farm planning or documentation. Using interactive dashboards and charts.
              </div>
            </div>
            <div className="help-card">
              <div className="icon-circle"><MdOutlineLock color="#2E7D32" /></div>
              <div>
                <strong>Blockchain Records</strong> – Understanding blockchain-secured records for transparency and data integrity. How to verify and view batch histories.
              </div>
            </div>
            <div className="help-card">
              <div className="icon-circle"><MdOutlineShoppingCart color="#2E7D32" /></div>
              <div>
                <strong>Orders & Requests (for Buyers)</strong> – Placing requests for eggs. Tracking order history and status. Notifications for confirmed or delivered orders.
              </div>
            </div>
            <div className="help-card">
              <div className="icon-circle"><MdOutlineSettings color="#2E7D32" /></div>
              <div>
                <strong>Settings & Profile</strong> – Updating user profile and account information. Managing notifications and preferences.
              </div>
            </div>
            <div className="help-card">
              <div className="icon-circle"><MdOutlineSupportAgent color="#2E7D32" /></div>
              <div>
                <strong>Troubleshooting & FAQs</strong> – Common issues with batch updates or predictions. How to contact support for technical help.
              </div>
            </div>
          </div>
        )}

        {activeTab === "faqs" && (
          <div className="help-section">
            {faqData.map((section, idx) => (
              <div key={idx} className="faq-category">
                <h3>{idx + 1}. {section.category}</h3>
                {section.faqs.map((item, i) => (
                  <div key={i} className="faq-item">
                    <div className="faq-question" onClick={() => toggleFaq(`${idx}-${i}`)}>
                      <MdHelpOutline size={24} style={{ marginRight: 8 }} /> {item.q}
                    </div>
                    {faqOpen[`${idx}-${i}`] && (
                      <div className="faq-answer">
                        <MdOutlineCheckCircle size={20} style={{ marginRight: 6, color:'#2E7D32' }} />
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab === "contact" && (
          <div className="help-section">
            <div className="contact-card">
              <div className="icon-circle"><MdEmail color="#2E7D32" /></div>
              <div>
                <strong>Email</strong>
                <p>support@agripredict.com</p>
              </div>
            </div>
            <div className="contact-card">
              <div className="icon-circle"><MdPhone color="#2E7D32" /></div>
              <div>
                <strong>Phone</strong>
                <p>+94 77 123 4567</p>
              </div>
            </div>
            <div className="contact-card">
              <div className="icon-circle"><MdAccessTime color="#2E7D32" /></div>
              <div>
                <strong>Support Hours</strong>
                <p>Monday – Friday, 9:00 AM – 5:00 PM (SL Time)</p>
              </div>
            </div>
            <div className="contact-card">
              <div className="icon-circle"><MdAccessTime color="#2E7D32" /></div>
              <div>
                <strong>Response Time</strong>
                <p>Typically within 24–48 working hours</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpCentre;