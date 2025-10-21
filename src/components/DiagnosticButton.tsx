/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { PGSNative } from '../services/PGSNative';

export default function DiagnosticButton() {
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runFullDiagnostic = async () => {
    setIsDiagnosing(true);
    setResults(null);

    const diagnosticResults: any = {
      timestamp: new Date().toISOString(),
      platform: {
        userAgent: navigator.userAgent,
        isAndroid: /Android/i.test(navigator.userAgent),
        isCapacitor: typeof window !== 'undefined' && (window as any).Capacitor !== undefined,
        capacitorPlatform: typeof window !== 'undefined' && (window as any).Capacitor?.getPlatform?.()
      },
      bridge: {
        windowPGSNative: typeof window !== 'undefined' && (window as any).PGSNative !== undefined,
        windowCapacitor: typeof window !== 'undefined' && (window as any).Capacitor !== undefined,
        windowCapacitorWebView: typeof window !== 'undefined' && (window as any).CapacitorWebView !== undefined,
        windowCapacitorWebViewAndroid: typeof window !== 'undefined' && (window as any).CapacitorWebView?.android !== undefined
      },
      pgsNative: {
        instance: PGSNative.getInstance() !== null,
        isNativeAndroid: PGSNative.getInstance().isNativeAndroid(),
        methods: {
          signIn: typeof PGSNative.getInstance().signIn === 'function',
          isAuthenticated: typeof PGSNative.getInstance().isAuthenticated === 'function',
          getCurrentUser: typeof PGSNative.getInstance().getCurrentUser === 'function',
          showLeaderboard: typeof PGSNative.getInstance().showLeaderboard === 'function',
          submitScore: typeof PGSNative.getInstance().submitScore === 'function'
        }
      },
      tests: {
        authentication: null,
        currentUser: null,
        leaderboard: null,
        submitScore: null,
        signIn: null
      }
    };

    try {
      // Test 1: Authentication
      console.log('🔍 Diagnostic: Testing authentication...');
      try {
        const authResult = await PGSNative.getInstance().isAuthenticated();
        diagnosticResults.tests.authentication = {
          success: true,
          result: authResult,
          error: null
        };
      } catch (error) {
        diagnosticResults.tests.authentication = {
          success: false,
          result: null,
          error: String(error)
        };
      }

      // Test 2: Get Current User
      console.log('🔍 Diagnostic: Testing getCurrentUser...');
      try {
        const userResult = await PGSNative.getInstance().getCurrentUser();
        diagnosticResults.tests.currentUser = {
          success: true,
          result: userResult,
          error: null
        };
      } catch (error) {
        diagnosticResults.tests.currentUser = {
          success: false,
          result: null,
          error: String(error)
        };
      }

      // Test 3: Show Leaderboard
      console.log('🔍 Diagnostic: Testing showLeaderboard...');
      try {
        const leaderboardResult = await PGSNative.getInstance().showLeaderboard();
        diagnosticResults.tests.leaderboard = {
          success: true,
          result: leaderboardResult,
          error: null
        };
      } catch (error) {
        diagnosticResults.tests.leaderboard = {
          success: false,
          result: null,
          error: String(error)
        };
      }

      // Test 4: Submit Score
      console.log('🔍 Diagnostic: Testing submitScore...');
      try {
        const submitResult = await PGSNative.getInstance().submitScore(1000);
        diagnosticResults.tests.submitScore = {
          success: true,
          result: submitResult,
          error: null
        };
      } catch (error) {
        diagnosticResults.tests.submitScore = {
          success: false,
          result: null,
          error: String(error)
        };
      }

      // Test 5: Try to sign in
      console.log('🔍 Diagnostic: Testing signIn...');
      try {
        const signInResult = await PGSNative.getInstance().signIn();
        diagnosticResults.tests.signIn = {
          success: true,
          result: signInResult,
          error: null
        };
      } catch (error) {
        diagnosticResults.tests.signIn = {
          success: false,
          result: null,
          error: String(error)
        };
      }

    } catch (error) {
      console.error('❌ Diagnostic error:', error);
      diagnosticResults.error = String(error);
    }

    setResults(diagnosticResults);
    setIsDiagnosing(false);

    // Log results to console for easy debugging
    console.log('🎯 MEGADIAGNÓSTICO COMPLETO:', diagnosticResults);
  };

  const getStatusIcon = (success: boolean | null) => {
    if (success === null) return '⏳';
    return success ? '✅' : '❌';
  };

  const getStatusColor = (success: boolean | null) => {
    if (success === null) return 'text-gray-500';
    return success ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={runFullDiagnostic}
        disabled={isDiagnosing}
        className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm transition-colors"
      >
        {isDiagnosing ? '🔍 DIAGNOSTICANDO...' : '🎯 MEGADIAGNÓSTICO'}
      </button>

      {results && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">🎯 MEGADIAGNÓSTICO GOOGLE PLAY GAMES</h2>
              <button
                onClick={() => setResults(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Platform Info */}
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">📱 PLATAFORMA</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>User Agent: {results.platform?.userAgent || 'N/A'}</div>
                  <div>Es Android: {results.platform?.isAndroid ? 'Sí' : 'No'}</div>
                  <div>Es Capacitor: {results.platform?.isCapacitor ? 'Sí' : 'No'}</div>
                  <div>Plataforma Capacitor: {results.platform?.capacitorPlatform || 'N/A'}</div>
                </div>
              </div>

              {/* Bridge Info */}
              <div className="bg-blue-100 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">🌉 BRIDGE JAVASCRIPT-NATIVO</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className={getStatusColor(results.bridge?.windowPGSNative)}>
                    {getStatusIcon(results.bridge?.windowPGSNative)} window.PGSNative
                  </div>
                  <div className={getStatusColor(results.bridge?.windowCapacitor)}>
                    {getStatusIcon(results.bridge?.windowCapacitor)} window.Capacitor
                  </div>
                  <div className={getStatusColor(results.bridge?.windowCapacitorWebView)}>
                    {getStatusIcon(results.bridge?.windowCapacitorWebView)} window.CapacitorWebView
                  </div>
                  <div className={getStatusColor(results.bridge?.windowCapacitorWebViewAndroid)}>
                    {getStatusIcon(results.bridge?.windowCapacitorWebViewAndroid)} CapacitorWebView.android
                  </div>
                </div>
              </div>

              {/* PGSNative Info */}
              <div className="bg-green-100 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">🎮 PGS NATIVE</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className={getStatusColor(results.pgsNative?.instance)}>
                    {getStatusIcon(results.pgsNative?.instance)} Instancia creada
                  </div>
                  <div className={getStatusColor(results.pgsNative?.isNativeAndroid)}>
                    {getStatusIcon(results.pgsNative?.isNativeAndroid)} Es Android nativo
                  </div>
                  <div className={getStatusColor(results.pgsNative?.methods?.signIn)}>
                    {getStatusIcon(results.pgsNative?.methods?.signIn)} Método signIn
                  </div>
                  <div className={getStatusColor(results.pgsNative?.methods?.isAuthenticated)}>
                    {getStatusIcon(results.pgsNative?.methods?.isAuthenticated)} Método isAuthenticated
                  </div>
                  <div className={getStatusColor(results.pgsNative?.methods?.getCurrentUser)}>
                    {getStatusIcon(results.pgsNative?.methods?.getCurrentUser)} Método getCurrentUser
                  </div>
                  <div className={getStatusColor(results.pgsNative?.methods?.showLeaderboard)}>
                    {getStatusIcon(results.pgsNative?.methods?.showLeaderboard)} Método showLeaderboard
                  </div>
                  <div className={getStatusColor(results.pgsNative?.methods?.submitScore)}>
                    {getStatusIcon(results.pgsNative?.methods?.submitScore)} Método submitScore
                  </div>
                </div>
              </div>

              {/* Test Results */}
              <div className="bg-yellow-100 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">🧪 RESULTADOS DE PRUEBAS</h3>
                <div className="space-y-2 text-sm">
                  <div className={getStatusColor(results.tests?.authentication?.success)}>
                    {getStatusIcon(results.tests?.authentication?.success)} Authentication: {results.tests?.authentication?.error || 'OK'}
                  </div>
                  <div className={getStatusColor(results.tests?.currentUser?.success)}>
                    {getStatusIcon(results.tests?.currentUser?.success)} Get Current User: {results.tests?.currentUser?.error || 'OK'}
                  </div>
                  <div className={getStatusColor(results.tests?.leaderboard?.success)}>
                    {getStatusIcon(results.tests?.leaderboard?.success)} Show Leaderboard: {results.tests?.leaderboard?.error || 'OK'}
                  </div>
                  <div className={getStatusColor(results.tests?.submitScore?.success)}>
                    {getStatusIcon(results.tests?.submitScore?.success)} Submit Score: {results.tests?.submitScore?.error || 'OK'}
                  </div>
                  <div className={getStatusColor(results.tests?.signIn?.success)}>
                    {getStatusIcon(results.tests?.signIn?.success)} Sign In: {results.tests?.signIn?.error || 'OK'}
                  </div>
                </div>
              </div>

              {/* Raw Results */}
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">📋 RESULTADOS COMPLETOS (JSON)</h3>
                <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}