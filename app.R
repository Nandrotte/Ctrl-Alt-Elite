library(shiny)
library(bslib)
library(ggplot2)
library(scales)

transactions <- data.frame(
    merchant = c(
        rep("Netflix", 3), rep("Disney+", 3), rep("Spotify", 3),
        rep("Adobe Creative Cloud", 3), rep("Basic-Fit", 3), "Coolblue"
    ),
    amount = c(
        17.99, 17.99, 17.99, 10.99, 10.99, 10.99, 10.99, 10.99, 10.99,
        24.99, 24.99, 24.99, 29.99, 29.99, 29.99, 249.00
    ),
    date = as.Date(c(
        "2026-07-03", "2026-08-03", "2026-09-03", "2026-07-09", "2026-08-09", "2026-09-09",
        "2026-07-12", "2026-08-12", "2026-09-12", "2026-07-18", "2026-08-18", "2026-09-18",
        "2026-07-24", "2026-08-24", "2026-09-24", "2026-09-16"
    )),
    stringsAsFactors = FALSE
)

subscription_profile <- data.frame(
    name = c("Netflix", "Disney+", "Spotify", "Adobe Creative Cloud", "Basic-Fit"),
    category = c("Streaming", "Streaming", "Muziek", "Software", "Sport"),
    color = c("#0057b8", "#003b70", "#087fc1", "#4d78a8", "#00a3e0"),
    stringsAsFactors = FALSE
)

detect_subscriptions <- function(payment_data) {
    detected <- lapply(split(payment_data, payment_data$merchant), function(payments) {
        payments <- payments[order(payments$date), , drop = FALSE]
        intervals <- as.numeric(diff(payments$date))
        amount_variation <- if (mean(payments$amount) == 0) 1 else diff(range(payments$amount)) / mean(payments$amount)
        monthly_pattern <- nrow(payments) >= 3 && median(intervals) >= 25 && median(intervals) <= 35
        stable_amount <- amount_variation <= 0.1
        if (!monthly_pattern || !stable_amount) {
            return(NULL)
        }

        profile <- subscription_profile[match(payments$merchant[1], subscription_profile$name), , drop = FALSE]
        confidence <- min(0.99, 0.72 + 0.08 * nrow(payments) + if (stable_amount) 0.08 else 0)
        data.frame(
            name = payments$merchant[1],
            category = profile$category,
            amount = round(mean(payments$amount), 2),
            next_date = max(payments$date) + round(median(intervals)),
            frequency = "Maandelijks",
            confidence = confidence,
            reason = paste(nrow(payments), "gelijke betalingen met een maandelijks patroon"),
            color = profile$color,
            status = "Herkend",
            stringsAsFactors = FALSE
        )
    })
    detected <- Filter(Negate(is.null), detected)
    if (length(detected) == 0) {
        return(data.frame())
    }
    do.call(rbind, detected)
}

subscriptions <- detect_subscriptions(transactions)

format_euro <- function(value) {
    paste0("€ ", formatC(value, format = "f", digits = 2, big.mark = ".", decimal.mark = ","))
}

label_euro <- format_euro

format_date <- function(value) {
    format(value, "%d %B", locale = "C")
}

subscription_row <- function(subscription) {
    div(
        class = "subscription-row",
        div(class = "subscription-icon", style = paste0("background:", subscription$color), substr(subscription$name, 1, 1)),
        div(
            class = "subscription-details",
            tags$strong(subscription$name),
            tags$span(class = "subscription-category", subscription$category)
        ),
        div(
            class = "subscription-timing",
            tags$strong(format_euro(subscription$amount)),
            tags$span(paste("op", format_date(subscription$next_date)))
        )
    )
}

ui <- page_navbar(
    title = div(class = "brand-lockup", span(class = "brand-mark", "KBC"), span("Subscription Manager")),
    id = "main_nav",
    selected = "Overzicht",
    header = tags$head(
        tags$meta(name = "viewport", content = "width=device-width, initial-scale=1"),
        tags$link(rel = "preconnect", href = "https://fonts.googleapis.com"),
        tags$link(rel = "preconnect", href = "https://fonts.gstatic.com", crossorigin = "anonymous"),
        tags$link(href = "https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700&display=swap", rel = "stylesheet"),
        tags$style(HTML("
            :root {
                --kbc-navy: #003b70;
                --kbc-blue: #0057b8;
                --kbc-cyan: #00a3e0;
                --kbc-bright: #087fc1;
                --kbc-sky: #e8f6fb;
                --kbc-ink: #172f4d;
                --kbc-muted: #5d7187;
                --kbc-line: #d1dce6;
                --kbc-surface: #ffffff;
                --kbc-bg: #f1f5f8;
                --kbc-positive: #16856a;
                --kbc-warning: #c75b35;
            }

            html, body {
                background: var(--kbc-bg);
                color: var(--kbc-ink);
                font-family: 'Source Sans 3', Arial, sans-serif;
            }

            body { min-height: 100vh; }

            .navbar {
                min-height: 76px;
                padding: 0 4vw;
                background: var(--kbc-blue) !important;
                border: 0;
                box-shadow: 0 2px 8px rgba(0, 59, 112, .2);
                position: relative;
            }

            .navbar::after { position: absolute; right: 0; bottom: 0; left: 0; height: 3px; background: var(--kbc-cyan); content: ''; }

            .navbar .container-fluid { max-width: 1440px; }
            .navbar-brand { margin-right: 42px; color: #fff !important; font-weight: 600; }
            .navbar-nav .nav-link { color: rgba(255, 255, 255, .72) !important; font-weight: 600; padding: 27px 15px 24px !important; }
            .navbar-nav .nav-link:hover { color: #fff !important; }
            .navbar-nav .nav-link.active { color: #fff !important; box-shadow: inset 0 -4px 0 var(--kbc-cyan); background: rgba(0, 0, 0, .1); }
            .brand-lockup { display: flex; align-items: center; gap: 11px; letter-spacing: .01em; }
            .brand-lockup > span:last-child { font-size: 15px; font-weight: 600; letter-spacing: .01em; }
            .brand-mark {
                display: grid;
                width: 36px;
                height: 36px;
                place-items: center;
                border: 1px solid rgba(255, 255, 255, .42);
                border-radius: 8px;
                color: #fff;
                font-family: 'Source Sans 3', Arial, sans-serif;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: .08em;
            }
            .nav-avatar {
                display: grid;
                width: 36px;
                height: 36px;
                margin-left: 18px;
                place-items: center;
                border: 1px solid rgba(255, 255, 255, .35);
                border-radius: 50%;
                color: #fff;
                font-size: 12px;
                font-weight: 700;
            }

            .dashboard-shell { max-width: 1440px; margin: 0 auto; padding: 0 4vw 64px; }
            .dashboard-shell::before { display: block; margin: 0 -4vw 38px; padding: 13px 4vw; background: #fff; border-bottom: 1px solid var(--kbc-line); color: var(--kbc-muted); content: 'KBC  /  Betalen  /  Abonnementen'; font-size: 12px; font-weight: 600; letter-spacing: .02em; }
            .welcome-row { display: flex; align-items: end; justify-content: space-between; gap: 24px; margin-bottom: 28px; }
            .eyebrow { margin: 0 0 9px; color: var(--kbc-bright); font-size: 10px; font-weight: 700; letter-spacing: .14em; }
            h1, h2, h3, .value-box-title { font-family: 'Source Sans 3', Arial, sans-serif; }
            h1 { max-width: 650px; margin: 0; color: var(--kbc-navy); font-size: clamp(26px, 3vw, 38px); line-height: 1.08; letter-spacing: 0; font-weight: 600; }
            .intro { max-width: 560px; margin: 8px 0 0; color: var(--kbc-muted); font-size: 15px; }
            .demo-status { display: inline-flex; align-items: center; gap: 9px; align-self: center; padding: 9px 12px; border-left: 3px solid var(--kbc-positive); background: #fff; color: var(--kbc-muted); font-size: 12px; font-weight: 600; white-space: nowrap; }
            .status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--kbc-positive); box-shadow: 0 0 0 4px rgba(22, 133, 106, .12); }

            .metrics-row, .main-grid, .bottom-grid { --bs-gutter-x: 18px; --bs-gutter-y: 18px; margin-bottom: 18px; }
            .value-box, .card { border: 1px solid var(--kbc-line) !important; border-radius: 8px !important; background: var(--kbc-surface) !important; box-shadow: 0 3px 10px rgba(0, 59, 112, .07) !important; overflow: hidden; }
            .value-box { min-height: 142px; overflow: hidden; }
            .value-box::before { display: block; height: 4px; background: var(--kbc-cyan); content: ''; }
            .value-box .value-box-title { color: var(--kbc-muted); font-size: 13px; font-weight: 600; }
            .value-box .value-box-value { color: var(--kbc-navy); font-family: 'Source Sans 3', Arial, sans-serif; font-size: 30px; font-weight: 700; }
            .value-box .value-box-showcase { color: var(--kbc-cyan); opacity: .95; }
            .card-header { padding: 20px 24px 15px; border-bottom: 1px solid var(--kbc-line); background: transparent; }
            .card-body { padding: 0 24px 22px; }
            .card-footer { padding: 14px 24px 18px; border-top: 1px solid var(--kbc-line); background: transparent; }
            .card-heading { display: flex; align-items: center; justify-content: space-between; gap: 14px; color: var(--kbc-navy); font-family: 'Source Sans 3', Arial, sans-serif; font-size: 16px; font-weight: 700; }
            .small-label { color: var(--kbc-bright); font-family: 'Source Sans 3', Arial, sans-serif; font-size: 10px; font-weight: 700; letter-spacing: .12em; }
            .muted-note { color: var(--kbc-muted); font-size: 12px; }

            .subscription-list { padding: 8px 24px 4px; }
            .subscription-row { display: flex; align-items: center; gap: 14px; padding: 15px 0; border-bottom: 1px solid #edf2f7; transition: background .15s ease; }
            .subscription-row:hover { background: var(--kbc-sky); }
            .subscription-row:last-child { border-bottom: 0; }
            .subscription-icon { display: grid; width: 40px; height: 40px; flex: 0 0 40px; place-items: center; border-radius: 6px; color: #fff; font-family: 'Source Sans 3', Arial, sans-serif; font-weight: 700; }
            .subscription-details { display: flex; min-width: 0; flex: 1; flex-direction: column; gap: 3px; }
            .subscription-details strong, .subscription-timing strong { color: var(--kbc-ink); font-size: 14px; }
            .subscription-category, .subscription-timing span { color: var(--kbc-muted); font-size: 12px; }
            .subscription-timing { display: flex; flex-direction: column; align-items: end; gap: 3px; }

            .overlap-card { display: flex; align-items: flex-start; gap: 17px; padding: 23px 24px; border-color: #b9dbe9 !important; border-radius: 8px !important; background: var(--kbc-sky) !important; }
            .alert-icon { display: grid; width: 38px; height: 38px; flex: 0 0 38px; place-items: center; border-radius: 6px; background: var(--kbc-blue); color: #fff; }
            .alert-eyebrow { margin-bottom: 7px; }
            .overlap-card h3, .reserve-card h3 { margin: 0; color: var(--kbc-navy); font-size: 19px; font-weight: 600; }
            .overlap-card p:not(.eyebrow), .reserve-card p { margin: 8px 0 17px; color: var(--kbc-muted); font-size: 13px; line-height: 1.55; }
            .btn-kbc, .btn-quiet { border-radius: 6px !important; font-weight: 700 !important; }
            .btn-kbc { border: 0 !important; background: var(--kbc-cyan) !important; color: var(--kbc-navy) !important; box-shadow: 0 5px 12px rgba(0, 163, 224, .2); }
            .btn-kbc:hover { background: var(--kbc-navy) !important; }
            .btn-quiet { border: 1px solid #b9dbe9 !important; background: #fff !important; color: var(--kbc-blue) !important; font-size: 12px; }

            .table-wrap { overflow-x: auto; padding: 2px 24px 15px; }
            .table { margin: 0; color: var(--kbc-ink); font-size: 13px; }
            .table thead th { border-bottom: 1px solid var(--kbc-line); color: var(--kbc-muted); font-size: 10px; letter-spacing: .08em; text-transform: uppercase; }
            .table tbody td { padding-top: 13px; padding-bottom: 13px; border-color: #edf2f7; vertical-align: middle; }
            .table-hover tbody tr:hover { background: var(--kbc-sky); }
            .table tbody tr:last-child td { border-bottom: 0; }
            .reserve-card { display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-top: 20px; padding: 23px 26px; border-color: var(--kbc-navy) !important; border-radius: 8px !important; background: var(--kbc-navy) !important; color: #fff; box-shadow: 0 8px 20px rgba(0, 45, 98, .16) !important; }
            .reserve-copy { display: flex; align-items: center; gap: 15px; }
            .reserve-copy h3 { color: #fff; }
            .reserve-copy p { margin-bottom: 0; color: rgba(255, 255, 255, .7); }
            .reserve-symbol { display: grid; width: 42px; height: 42px; place-items: center; border: 1px solid rgba(255, 255, 255, .3); border-radius: 8px; color: var(--kbc-cyan); }
            .reserve-control .checkbox { margin: 0; color: #fff; }
            .reserve-control .checkbox label { font-size: 12px; font-weight: 600; }
            .reserve-amount { display: flex; flex-direction: column; align-items: end; gap: 4px; white-space: nowrap; }
            .reserve-amount span { color: rgba(255, 255, 255, .65); font-size: 11px; }
            .reserve-amount strong { color: #fff; font-family: 'Source Sans 3', Arial, sans-serif; font-size: 22px; }

            .modal-content { border: 0; border-radius: 8px; box-shadow: 0 18px 50px rgba(0, 33, 73, .2); }
            .modal-header { border-bottom-color: var(--kbc-line); }
            .modal-title { color: var(--kbc-navy); font-family: 'Source Sans 3', Arial, sans-serif; font-weight: 700; }
            .form-control { border-color: var(--kbc-line); border-radius: 6px; }
            .form-control:focus { border-color: var(--kbc-cyan); box-shadow: 0 0 0 3px rgba(0, 163, 224, .14); }

            @media (max-width: 900px) {
                .dashboard-shell { padding-top: 30px; }
                .welcome-row { align-items: flex-start; flex-direction: column; }
                .demo-status { align-self: flex-start; }
            }
            @media (max-width: 600px) {
                .dashboard-shell { padding: 0 16px 42px; }
                .navbar { padding: 0 16px; }
                .navbar-brand { margin-right: 0; }
                .navbar-nav .nav-link { padding: 16px 12px !important; }
                h1 { font-size: 34px; }
                .intro { font-size: 14px; }
                .dashboard-shell::before { margin-right: -16px; margin-left: -16px; padding-right: 16px; padding-left: 16px; }
                .card-header, .card-body, .card-footer { padding-left: 17px; padding-right: 17px; }
                .subscription-list, .table-wrap { padding-left: 17px; padding-right: 17px; }
                .overlap-card, .reserve-card { align-items: flex-start; flex-direction: column; padding: 20px 17px; }
                .reserve-control, .reserve-amount { align-self: stretch; align-items: flex-start; }
                .reserve-copy { align-items: flex-start; }
            }
        "))
    ),
    nav_panel(
        "Overzicht",
        div(
            class = "dashboard-shell",
            div(
                class = "welcome-row",
                div(
                    tags$p(class = "eyebrow", "SLIMMER MET JE GELD"),
                    tags$h1("Je abonnementen, helder in beeld."),
                    tags$p(class = "intro", "Bekijk wat er binnenkort afgaat en houd ruimte in je maandbudget.")
                ),
                div(class = "demo-status", span(class = "status-dot"), "Demo met voorbeelddata")
            ),
            layout_columns(
                value_box(
                    title = "Volgende afschrijving",
                    value = textOutput("next_payment"),
                    showcase = icon("calendar-days"),
                    theme = "kbc-blue"
                ),
                value_box(
                    title = "Vaste kosten / maand",
                    value = textOutput("monthly_total"),
                    showcase = icon("arrow-trend-up"),
                    theme = "kbc-blue"
                ),
                value_box(
                    title = "Actieve abonnementen",
                    value = length(subscriptions$name),
                    showcase = icon("layer-group"),
                    theme = "kbc-mint"
                ),
                col_widths = c(4, 4, 4),
                class = "metrics-row"
            ),
            layout_columns(
                card(
                    card_header(div(class = "card-heading", span("Komende afschrijvingen"), tags$span(class = "small-label", "OKTOBER 2026"))),
                    div(class = "subscription-list", uiOutput("subscription_list")),
                    card_footer(tags$span(class = "muted-note", "Op basis van herkende terugkerende betalingen"))
                ),
                card(
                    card_header(div(class = "card-heading", span("Waar gaat je geld naartoe?"), tags$span(class = "small-label", "PER MAAND"))),
                    plotOutput("spend_plot", height = "290px"),
                    card_footer(tags$span(class = "muted-note", "Streaming is goed voor 35% van je vaste kosten"))
                ),
                col_widths = c(7, 5),
                class = "main-grid"
            ),
            layout_columns(
                card(
                    class = "overlap-card",
                    div(class = "alert-icon", icon("bolt")),
                    div(
                        tags$p(class = "eyebrow alert-eyebrow", "KANS OM TE BESPAREN"),
                        tags$h3("Je hebt twee streamingdiensten"),
                        tags$p("Netflix en Disney+ lijken allebei actief. Bekijk je kijkgedrag en beslis zelf of je beide wilt behouden."),
                        actionButton("compare_btn", "Vergelijk abonnementen", class = "btn-kbc")
                    )
                ),
                card(
                    card_header(
                        div(
                            class = "card-heading",
                            span("Jouw abonnementen"),
                            div(
                                class = "table-actions",
                                selectInput("category_filter", NULL, choices = c("Alle categorieën", sort(unique(subscriptions$category))), selected = "Alle categorieën", width = "170px"),
                                actionButton("add_btn", "Abonnement toevoegen", class = "btn-quiet")
                            )
                        )
                    ),
                    div(class = "table-wrap", tableOutput("subscription_table"))
                ),
                col_widths = c(5, 7),
                class = "bottom-grid"
            ),
            card(
                class = "reserve-card",
                div(
                    class = "reserve-copy",
                    div(class = "reserve-symbol", icon("lock")),
                    div(tags$h3("Zet je vaste bedrag opzij"), tags$p("Maak ruimte voor je abonnementen voordat ze worden afgeschreven."))
                ),
                div(class = "reserve-control", checkboxInput("reserve_enabled", "Reserve actief", value = TRUE)),
                div(class = "reserve-amount", tags$span("Maandelijks doel"), tags$strong(textOutput("reserve_target", inline = TRUE)))
            )
        )
    ),
    nav_spacer(),
    nav_item(tags$span(class = "nav-avatar", "JD"))
)

server <- function(input, output, session) {
    subscription_data <- reactiveVal(subscriptions)

    filtered_subscriptions <- reactive({
        data <- subscription_data()
        selected_category <- input$category_filter
        if (is.null(selected_category) || selected_category == "Alle categorieën") {
            data
        } else {
            data[data$category == selected_category, , drop = FALSE]
        }
    })

    output$next_payment <- renderText({
        data <- filtered_subscriptions()
        if (nrow(data) == 0) {
            return("Geen abonnementen")
        }
        format_euro(data$amount[which.min(data$next_date)])
    })
    output$monthly_total <- renderText({
        format_euro(sum(filtered_subscriptions()$amount))
    })

    output$subscription_list <- renderUI({
        data <- filtered_subscriptions()
        if (nrow(data) == 0) {
            return(tags$p(class = "muted-note", "Geen abonnementen in deze categorie."))
        }
        tagList(lapply(seq_len(nrow(data)), function(index) subscription_row(data[index, ])))
    })

    output$spend_plot <- renderPlot({
        plot_data <- aggregate(amount ~ category, filtered_subscriptions(), sum)
        validate(need(nrow(plot_data) > 0, "Geen data voor deze categorie."))
        plot_data$category <- factor(plot_data$category, levels = plot_data$category[order(plot_data$amount)])
        ggplot(plot_data, aes(x = category, y = amount, fill = category)) +
            geom_col(width = 0.62, show.legend = FALSE) +
            geom_text(aes(label = format_euro(amount)), vjust = -0.6, family = "sans", size = 3.5, color = "#10284b") +
            scale_fill_manual(values = c("Muziek" = "#087fc1", "Software" = "#4d78a8", "Sport" = "#003b70", "Streaming" = "#0057b8")) +
            scale_y_continuous(expand = expansion(mult = c(0, 0.18)), labels = format_euro) +
            labs(x = NULL, y = NULL) +
            theme_minimal(base_family = "sans") +
            theme(
                panel.grid.major.x = element_blank(), panel.grid.minor = element_blank(),
                panel.grid.major.y = element_line(color = "#e8edf3"),
                axis.text = element_text(color = "#607088", size = 10),
                plot.margin = margin(12, 18, 4, 8)
            )
    })

    output$subscription_table <- renderTable(
        {
            data <- filtered_subscriptions()
            data.frame(
                Abonnement = data$name,
                Categorie = data$category,
                Bedrag = vapply(data$amount, format_euro, character(1)),
                `Volgende datum` = format(data$next_date, "%d/%m/%Y"),
                check.names = FALSE
            )
        },
        striped = TRUE,
        bordered = FALSE,
        hover = TRUE,
        spacing = "s"
    )

    output$reserve_target <- renderText({
        if (isTRUE(input$reserve_enabled)) format_euro(sum(subscriptions$amount)) else "Uitgeschakeld"
    })

    observeEvent(input$compare_btn, {
        data <- subscription_data()
        streaming <- data[data$category == "Streaming", , drop = FALSE]
        validate(need(nrow(streaming) >= 2, "Er zijn minstens twee streamingdiensten nodig om te vergelijken."))
        showModal(modalDialog(
            title = "Streaming naast elkaar",
            tags$p(streaming$name[1], strong(format_euro(streaming$amount[1])), "per maand"),
            tags$p(streaming$name[2], strong(format_euro(streaming$amount[2])), "per maand"),
            tags$hr(),
            tags$p(strong(format_euro(sum(streaming$amount[1:2]))), " aan dubbele streamingkosten per maand."),
            easyClose = TRUE, footer = modalButton("Sluiten")
        ))
    })

    observeEvent(input$add_btn, {
        showModal(modalDialog(
            title = "Abonnement toevoegen",
            textInput("new_name", "Naam", placeholder = "bv. Videoland"),
            selectInput("new_category", "Categorie", choices = c("Streaming", "Muziek", "Software", "Sport", "Overig")),
            numericInput("new_amount", "Maandbedrag", value = 9.99, min = 0, step = 0.01),
            dateInput("new_date", "Volgende afschrijving", value = Sys.Date() + 30, format = "dd/mm/yyyy"),
            footer = tagList(modalButton("Annuleren"), actionButton("save_new_btn", "Opslaan", class = "btn-kbc")),
            easyClose = TRUE
        ))
    })

    observeEvent(input$save_new_btn, {
        req(input$new_name, input$new_amount, input$new_category, input$new_date)
        new_subscription <- data.frame(
            name = trimws(input$new_name),
            category = input$new_category,
            amount = as.numeric(input$new_amount),
            next_date = as.Date(input$new_date),
            color = "#0057b8",
            stringsAsFactors = FALSE
        )
        validate(need(nzchar(new_subscription$name), "Geef een naam op."))
        subscription_data(rbind(subscription_data(), new_subscription))
        updateSelectInput(session, "category_filter", choices = c("Alle categorieën", sort(unique(subscription_data()$category))))
        removeModal()
        showNotification("Abonnement toegevoegd aan je overzicht.", type = "message")
    })
}

shinyApp(ui, server)

# %%
