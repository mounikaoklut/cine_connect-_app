package com.cineconnect.talent

import android.app.Application
import com.cineconnect.talent.data.api.CineApiFactory
import com.cineconnect.talent.data.repository.CineRepository
import com.cineconnect.talent.data.session.SessionManager

class CineConnectApp : Application() {

    lateinit var session: SessionManager
        private set

    lateinit var repository: CineRepository
        private set

    override fun onCreate() {
        super.onCreate()
        session = SessionManager(this)
        repository = CineRepository(CineApiFactory.create(session), session)
    }
}
